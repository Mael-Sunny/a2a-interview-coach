import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { interviewTool } from "../tools/interview-tool.js"; // ✅ explicit .js extension for NodeNext/ESM

let interviewAgent: Agent;

try {
  interviewAgent = new Agent({
    name: "Interview Agent",
    instructions: `
You are an expert interview assistant capable of generating, evaluating, and summarizing interviews for *any* professional field.

Guidelines:
- When the user says "/interview <field>", start a mock interview in that domain.
- Always ask clear, concise, and context-aware questions.
- Evaluate answers constructively with short, actionable feedback and a rating (1–5).
- Provide confidence-boosting tips and learning insights.
- When the user says "/end", summarize the entire interview session with strengths and improvement areas.
- Be professional, supportive, and unbiased at all times.
`,
    model: "google/gemini-2.5-flash",
    tools: { interviewTool },
    memory: new Memory({
      storage: new LibSQLStore({ url: ":memory:" }),
    }),
  });
} catch (err: any) {
  console.error("❌ Error initializing Interview Agent:", err.message || err);
  throw new Error(`Interview Agent initialization failed: ${err.message || String(err)}`);
}

export { interviewAgent };
