import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "fs/promises";

let groq: Groq | null = null;
let genai: GoogleGenAI | null = null;

const getGroq = () => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groq;
};

const getGenAI = () => {
    if (!genai) {
        genai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }
    return genai;
};

const VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";
const VIDEO_MODEL = process.env.GEMINI_VIDEO_MODEL || "gemini-3.5-flash";

const IMAGE_PROMPT = `You are assisting a dermatology consultation. Analyze this photo of a patient's skin.

Focus only on visible findings.

Describe:
1. What is visibly present (color, texture, borders, distribution, location if identifiable)
2. Possible explanations
3. Concerning visual features, if any
4. Whether the image quality is good enough; if not, what a better photo should show

Do not provide a definitive diagnosis.
Clearly distinguish observations from possibilities. Be concise.`;

const VIDEO_PROMPT = `Analyze this medical video of a patient's skin.

Focus only on visible findings.

Identify:
1. What is visibly present
2. Changes across the video
3. Possible explanations
4. Concerning visual features
5. What additional information would be useful

Do not provide a definitive diagnosis.
Clearly distinguish observations from possibilities. Be concise.`;

const analyzeImage = async (filePath: string, mimeType: string): Promise<string> => {
    const base64 = await readFile(filePath, { encoding: "base64" });

    const response = await getGroq().chat.completions.create({
        model: VISION_MODEL,
        max_completion_tokens: 1024,
        reasoning_effort: "none",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: IMAGE_PROMPT,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64}`,
                        },
                    },
                ],
            },
        ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    return raw
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .replace(/<think>[\s\S]*/g, "")
        .trim();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const analyzeVideo = async (filePath: string, mimeType: string): Promise<string> => {
    const ai = getGenAI();

    let video = await ai.files.upload({
        file: filePath,
        config: {
            mimeType: mimeType,
        },
    });

    // wait until the uploaded file is processed and usable
    const deadline = Date.now() + 120_000;
    while (video.state === "PROCESSING" && Date.now() < deadline) {
        await sleep(2000);
        video = await ai.files.get({ name: video.name! });
    }

    if (video.state === "FAILED") {
        throw new Error("video processing failed on Gemini");
    }

    const response = await ai.models.generateContent({
        model: VIDEO_MODEL,
        contents: [
            {
                fileData: {
                    fileUri: video.uri,
                    mimeType: mimeType,
                },
            },
            {
                text: VIDEO_PROMPT,
            },
        ],
    });

    return (response.text ?? "").trim();
};

export { analyzeImage, analyzeVideo };
