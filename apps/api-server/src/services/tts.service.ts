import { DeepgramClient } from "@deepgram/sdk";
import { writeFile } from "fs/promises";

let deepgram: DeepgramClient | null = null;

const getDeepgram = () => {
    if (!deepgram) {
        deepgram = new DeepgramClient({
            apiKey: process.env.DEEPGRAM_API_KEY!,
        });
    }
    return deepgram;
};

// deepgram tts has a ~2000 char limit per request, keep spoken replies inside it
const MAX_TTS_CHARS = 1900;

const cleanForSpeech = (text: string): string => {
    return text
        .replace(/[*_#`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_TTS_CHARS);
};

const textToSpeech = async (text: string, outPath: string): Promise<void> => {
    const response = await getDeepgram().speak.v1.audio.generate({
        text: cleanForSpeech(text),
        model: "aura-2-thalia-en",
        encoding: "linear16",
        container: "wav",
    });

    const audioBuffer = await response.arrayBuffer();

    await writeFile(outPath, Buffer.from(audioBuffer));
};

export { textToSpeech };
