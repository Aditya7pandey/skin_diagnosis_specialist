import { DeepgramClient } from "@deepgram/sdk";
import { writeFile } from "fs/promises";
import dotenv from 'dotenv'

dotenv.config();

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY!,
});

const text = `
Hello. Based on the information provided, there appears to be some redness
and mild swelling in the affected area. This is not a definitive diagnosis,
and you should consult a qualified medical professional for proper evaluation.
`;

async function main() {
  const response = await deepgram.speak.v1.audio.generate({
    text,
    model: "aura-2-thalia-en",
    encoding: "linear16",
    container: "wav",
  });

  const audioBuffer = await response.arrayBuffer();

  await writeFile(
    "ai-doctor-response.wav",
    Buffer.from(audioBuffer)
  );

  console.log("Audio saved to ai-doctor-response.wav");
}

main().catch(console.error);