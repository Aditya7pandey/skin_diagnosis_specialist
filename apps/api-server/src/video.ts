import dotenv from 'dotenv'

dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run(){

const video = await ai.files.upload({
  file: "./patient-video.mp4",
  config: {
    mimeType: "video/mp4",
  },
});

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash",

  contents: [
    {
      fileData: {
        fileUri: video.uri,
        mimeType: "video/mp4",
      },
    },
    {
      text: `
        Analyze this medical video.

        Focus only on visible findings.

        Identify:
        1. What is visibly present
        2. Changes across the video
        3. Possible explanations
        4. Concerning visual features
        5. What additional information would be useful

        Do not provide a definitive diagnosis.
        Clearly distinguish observations from possibilities.
      `,
    },
  ],
});

console.log(response.text);
}

run();