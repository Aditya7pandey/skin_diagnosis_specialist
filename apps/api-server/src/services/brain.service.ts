import Groq from "groq-sdk";

let groq: Groq | null = null;

const getGroq = () => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groq;
};

const MODEL = process.env.GROQ_MODEL || "qwen/qwen3.6-27b";

const SYSTEM_PROMPT = `You are Derma, a warm and careful AI skin-specialist assistant talking with a patient on a live voice call.

How to speak:
- Your replies are read out loud. Keep them short and natural: 2 to 4 plain sentences.
- No markdown, no bullet points, no emojis, no headings. Just spoken language.
- Be calm and reassuring, never alarming.

Consultation flow you must follow:
1. First understand the problem. Ask at most one or two focused follow-up questions per turn (where it is, how long, itching or pain, spreading, any triggers or new products).
2. You must NOT give any assessment, diagnosis or treatment advice before the patient has shared at least one photo or a short video of the affected skin. If they have not shared one yet, ask them to tap the attach button and send a clear, well-lit close-up photo or a short video of the area.
3. Findings from shared media appear in the conversation marked as [PHOTO FINDINGS] or [VIDEO FINDINGS]. Once you have findings plus the patient's answers, give your assessment in this spoken order: the most likely possibilities in plain words, simple self-care advice, warning signs that need urgent care, and when to see a dermatologist in person.
4. End your assessment by reminding them once that this is not a medical diagnosis and a dermatologist should confirm it.
5. If the patient asks about something unrelated to skin health, gently bring the conversation back.

Never invent findings that are not in the media analysis. If an image or video was unclear, say so and ask for a better one.`;

type BrainTurn = {
    role: "user" | "assistant";
    content: string;
};

// qwen-style models can emit <think> blocks, strip them before speaking
// (handles the unclosed case too, when the block got cut off by the token limit)
const stripReasoning = (text: string): string => {
    return text
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .replace(/<think>[\s\S]*/g, "")
        .trim();
};

const askBrain = async (history: BrainTurn[]): Promise<string> => {
    const response = await getGroq().chat.completions.create({
        model: MODEL,
        temperature: 0.6,
        max_completion_tokens: 1024,
        // qwen3 thinking would eat the token budget and add seconds of latency,
        // neither works for a live voice call
        reasoning_effort: "none",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
        ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const reply = stripReasoning(raw);

    return reply || "I'm sorry, I didn't catch that. Could you say it again?";
};

export { askBrain };
export type { BrainTurn };
