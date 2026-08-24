import { prisma } from "@repo/db";
import { Request, Response } from "express";
import path from "path";
import { UPLOADS_DIR } from "../lib/uploads";
import { speechToText } from "../services/stt.service";
import { textToSpeech } from "../services/tts.service";
import { askBrain, BrainTurn } from "../services/brain.service";
import { analyzeImage, analyzeVideo } from "../services/vision.service";

const GREETING = "Hi, I'm Derma, your AI skin assistant. Tell me what's going on with your skin, where it is, how long you've had it, and how it feels. Once I understand the problem, I'll ask you for a photo or a short video so I can take a proper look.";

const generateAudio = async (text: string): Promise<string | null> => {
    try {
        const filename = `tts-${Date.now()}-${Math.round(Math.random() * 1e9)}.wav`;
        await textToSpeech(text, path.join(UPLOADS_DIR, filename));
        return `/uploads/${filename}`;
    } catch (error) {
        // a tts failure should never block the consultation, the text reply still works
        console.error("tts failed:", error);
        return null;
    }
};

const createConsultation = async (req: Request, res: Response) => {
    try {
        const consultation = await prisma.consultation.create({
            data: {
                userId: req.userId as string,
            },
        });

        const audioUrl = await generateAudio(GREETING);

        const message = await prisma.message.create({
            data: {
                consultationId: consultation.id,
                role: "assistant",
                content: GREETING,
                audioUrl: audioUrl,
            },
        });

        return res.status(200).json({
            consultation: consultation,
            messages: [message],
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }
    }
};

const listConsultations = async (req: Request, res: Response) => {
    try {
        const consultations = await prisma.consultation.findMany({
            where: {
                userId: req.userId as string,
            },
            orderBy: {
                updatedAt: "desc",
            },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        return res.json({
            consultations: consultations.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                lastMessage: c.messages[0]?.content ?? null,
            })),
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }
    }
};

const getConsultation = async (req: Request, res: Response) => {
    try {
        const consultation = await prisma.consultation.findFirst({
            where: {
                id: req.params.id as string,
                userId: req.userId as string,
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!consultation) {
            return res.status(404).json({
                message: "consultation not found",
            });
        }

        const { messages, ...rest } = consultation;

        return res.json({
            consultation: rest,
            messages: messages,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }
    }
};

// turns a stored message into what the brain sees, media findings included
const toBrainTurn = (m: {
    role: string;
    content: string;
    mediaType: string | null;
    analysis: string | null;
}): BrainTurn => {
    if (m.role === "user" && m.mediaType) {
        const label = m.mediaType === "video" ? "VIDEO FINDINGS" : "PHOTO FINDINGS";
        const findings =
            m.analysis ??
            "The file could not be analyzed automatically. Ask the patient to try another clear, well-lit photo or video.";
        return {
            role: "user",
            content: `${m.content}\n\n[${label}]\n${findings}`,
        };
    }
    return {
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
    };
};

const sendMessage = async (req: Request, res: Response) => {
    try {
        const consultationId = req.params.id as string;

        const consultation = await prisma.consultation.findFirst({
            where: {
                id: consultationId,
                userId: req.userId as string,
            },
        });

        if (!consultation) {
            return res.status(404).json({
                message: "consultation not found",
            });
        }

        const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
        const audioFile = files?.audio?.[0];
        const mediaFile = files?.media?.[0];

        let text = (req.body?.text ?? "").toString().trim();

        if (!text && audioFile) {
            text = await speechToText(audioFile.path);
        }

        if (!text && !mediaFile) {
            return res.status(422).json({
                error: "no_speech",
                message: "I couldn't hear anything, please try again.",
            });
        }

        let mediaType: string | null = null;
        let mediaUrl: string | null = null;
        let analysis: string | null = null;

        if (mediaFile) {
            mediaType = mediaFile.mimetype.startsWith("video") ? "video" : "image";
            mediaUrl = `/uploads/${mediaFile.filename}`;
            try {
                analysis =
                    mediaType === "video"
                        ? await analyzeVideo(mediaFile.path, mediaFile.mimetype)
                        : await analyzeImage(mediaFile.path, mediaFile.mimetype);
            } catch (error) {
                console.error("media analysis failed:", error);
                analysis = null;
            }
        }

        if (!text) {
            text = mediaType === "video" ? "I've shared a video of the area." : "I've shared a photo of the area.";
        }

        const userMessage = await prisma.message.create({
            data: {
                consultationId: consultationId,
                role: "user",
                content: text,
                mediaType: mediaType,
                mediaUrl: mediaUrl,
                analysis: analysis,
            },
        });

        // first real user turn names the consultation
        if (consultation.title === "New consultation") {
            await prisma.consultation.update({
                where: { id: consultationId },
                data: { title: text.slice(0, 60) },
            });
        } else {
            await prisma.consultation.update({
                where: { id: consultationId },
                data: { updatedAt: new Date() },
            });
        }

        const previous = await prisma.message.findMany({
            where: { consultationId: consultationId },
            orderBy: { createdAt: "asc" },
            take: 40,
        });

        const turns: BrainTurn[] = previous.map(toBrainTurn);

        let reply: string;
        try {
            reply = await askBrain(turns);
        } catch (error) {
            console.error("brain failed:", error);
            reply = "I'm having trouble connecting right now. Give me a moment and please say that again.";
        }

        const audioUrl = await generateAudio(reply);

        const assistantMessage = await prisma.message.create({
            data: {
                consultationId: consultationId,
                role: "assistant",
                content: reply,
                audioUrl: audioUrl,
            },
        });

        return res.json({
            userMessage: userMessage,
            assistantMessage: assistantMessage,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }
    }
};

export {
    createConsultation,
    listConsultations,
    getConsultation,
    sendMessage,
};
