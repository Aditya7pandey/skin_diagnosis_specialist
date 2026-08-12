import express from 'express'

const app = express();
app.use(express.json());

const PORT = 5000;

app.listen(PORT,()=>{
    console.log("app is running in 5000")
})

import dotenv from 'dotenv'
dotenv.config();
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function run(){


const response = await groq.chat.completions.create({
  model: "qwen/qwen3.6-27b",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and describe what is happening in detail.",
        },
        {
          type: "image_url",
          image_url: {
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNxjZlNN9qGxvuQC1uvkAhdqHqegP6A9lmMhF60cXJ-Q&s",
          },
        },
      ],
    },
  ],
});

//@ts-ignore
console.log(response.choices[0].message.content);
}

run();