import { DeepgramClient } from "@deepgram/sdk";
import { createReadStream } from "fs";

let deepgram: DeepgramClient | null = null;

const getDeepgram = () => {
    if (!deepgram) {
        deepgram = new DeepgramClient({
            apiKey: process.env.DEEPGRAM_API_KEY!,
        });
    }
    return deepgram;
};

const speechToText = async (filePath: string): Promise<string> => {
    const response = await getDeepgram().listen.v1.media.transcribeFile(
        createReadStream(filePath),
        {
            model: "nova-3",
            smart_format: true,
        }
    );

    const transcript =
        (response as any)?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return String(transcript).trim();
};

export { speechToText };
