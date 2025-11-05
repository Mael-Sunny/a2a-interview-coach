// src/mastra/tools/interview-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// --- Safety Check for Missing Keys ---
if (!GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in environment variables.");
}

// ✅ Initialize Gemini client according to official SDK
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Reusable function to call Gemini model safely ---
async function callGemini(prompt: string): Promise<string> {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt must be a non-empty string.");
    }

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // ✅ Normalize Gemini SDK response
    const text =
      (response as any)?.text ||
      (typeof (response as any)?.response?.text === "function" &&
        (response as any).response.text()) ||
      (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text || !String(text).trim()) {
      throw new Error("Empty response returned from Gemini model.");
    }

    return String(text).trim();
  } catch (error: any) {
    console.error("🚨 Gemini API Error:", error?.message || error);
    throw new Error(`Gemini API call failed: ${error?.message || String(error)}`);
  }
}

// --- Mastra Tool Definition ---
export const interviewTool = createTool({
  id: "interview-tool",
  description:
    "A multi-purpose interview assistant tool for generating questions, evaluating answers, and summarizing interview sessions across any field.",
  inputSchema: z.object({
    action: z.enum(["generate", "evaluate", "summarize"]),
    topic: z.string().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    question: z.string().optional(),
    answer: z.string().optional(),
    feedbackList: z.array(z.string()).optional(),
  }),
  outputSchema: z.union([
    z.object({ question: z.string() }),
    z.object({ feedback: z.string() }),
    z.object({ summary: z.string() }),
  ]),

  execute: async ({ context }) => {
    try {
      const { action, topic = "general", difficulty = "beginner" } = context;

      switch (action) {
        // --- Generate Interview Question ---
        case "generate": {
          const prompt = `Generate one concise, relevant interview question for ${topic} at ${difficulty} difficulty. Focus on technical or behavioral insight. Return only the question text.`;
          const question = await callGemini(prompt);
          return { question };
        }

        // --- Evaluate a Candidate's Answer ---
        case "evaluate": {
          const question = context.question || "Question not provided.";
          const answer = context.answer || "Answer not provided.";

          const prompt = `You are an expert interviewer. Evaluate this candidate's response briefly.

Question: ${question}
Answer: ${answer}

Respond concisely with:
- Feedback (1-3 sentences)
- Rating: X/5
- Tip: one actionable improvement suggestion.`;

          const feedback = await callGemini(prompt);
          return { feedback };
        }

        // --- Summarize Feedback from Multiple Sessions ---
        case "summarize": {
          const feedbackList = context.feedbackList || [];
          if (feedbackList.length === 0) {
            throw new Error("No feedback entries provided for summarization.");
          }

          const joinedFeedback = feedbackList.join("\n\n");
          const prompt = `Summarize the following interview feedback entries into:
1. Overall performance (1-2 sentences)
2. Two strengths
3. Two improvement areas
4. One encouraging closing line

Feedback entries:
${joinedFeedback}`;

          const summary = await callGemini(prompt);
          return { summary };
        }

        // --- Invalid Action Handling ---
        default:
          throw new Error(`Invalid action type: ${action}`);
      }
    } catch (err: any) {
      console.error("⚠️ Interview Tool Error:", err.message || err);
      throw new Error(`Interview Tool failed: ${err.message || String(err)}`);
    }
  },
});
