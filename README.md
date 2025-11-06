<div align="center">

# 🤖 A2A Interview Coach

**AI-powered mock interview assistant built with [Mastra](https://mastra.ai) and Google Gemini**

[![Mastra Cloud](https://img.shields.io/badge/Deployed%20on-Mastra%20Cloud-blue?logo=vercel&logoColor=white)](https://cloud.mastra.ai)
[![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Engine-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## 🧠 Overview

The **A2A Interview Coach** is an interactive AI interview agent that simulates real interview sessions for engineering disciplines — starting with **Mechanical Engineering**.  

It leverages **Mastra’s Agent-to-Agent (A2A)** communication framework and **Google’s Generative AI (Gemini)** to generate context-aware interview questions and maintain conversation flow.

---

## ✨ Features

- 🧩 **AI-Driven Questioning** — Generates discipline-specific interview questions dynamically.  
- 💬 **Interactive Conversation** — Maintains interview context across multiple exchanges.  
- ⚙️ **JSON-RPC Compatible API** — Follows Mastra’s standard A2A message structure.  
- ☁️ **Cloud Ready** — Seamlessly deployable on **Mastra Cloud**.  
- 🔐 **Secure Config** — Uses `.env` for API key management.  

---

## 🧰 Tech Stack

| Layer | Technology |
|:------|:------------|
| Core Framework | [Mastra](https://mastra.ai) |
| Language | TypeScript (Node.js) |
| AI Model | Google Gemini (`@google/genai`) |
| Data Store | LibSQL (in-memory for dev) |
| Logger | Pino |
| Deployment | Mastra Cloud |
| Testing | Postman / cURL |

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Mael-Sunny/a2a-interview-coach.git
cd a2a-interview-coach
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Configure Environment Variables
Create a .env file in your project root:

bash
Copy code
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
If your code uses GEMINI_API_KEY, you can safely include both for compatibility:

bash
Copy code
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here


🧑‍💻 Local Development
Run Development Server
bash
Copy code
npm run dev
Build Project
bash
Copy code
npm run build
After building, compiled files will appear in .mastra/output.

🧪 Testing with Postman or cURL
Start your server locally (e.g., http://localhost:3000) and send this test payload:

bash
Copy code
curl -s -X POST "http://localhost:3000/a2a/agent/interviewAgent" \
 -H "Content-Type: application/json" \
 -d '{
   "jsonrpc":"2.0",
   "id":"test-1",
   "method":"message/send",
   "params":{
     "message":{
       "kind":"message",
       "role":"user",
       "parts":[{"kind":"text","text":"/interview mechanical engineering"}],
       "messageId":"msg-1",
       "taskId":"task-1"
     },
     "configuration":{"blocking":true}
   }
 }' | jq

 
✅ Expected Response:
The agent replies with the first interview question for Mechanical Engineering.

💬 Continue the Conversation
You can send a follow-up message to continue the mock interview:

bash
Copy code
curl -X POST "https://howling-squeaking-motherbo.mastra.cloud/a2a/agent/interviewAgent" \
 -H "Content-Type: application/json" \
 -d '{
   "jsonrpc": "2.0",
   "id": "test-2",
   "method": "message/send",
   "params": {
     "message": {
       "kind": "message",
       "role": "user",
       "parts": [
         { "kind": "text", "text": "I would consider strength, weight, cost, and corrosion resistance." }
       ],
       "messageId": "msg-2",
       "taskId": "task-1"
     },
     "configuration": { "blocking": true }
   }
 }'
☁️ Deployment on Mastra Cloud
Push your repository to GitHub.

Connect the repo to Mastra Cloud.

In your Mastra config, ensure you add this to avoid build issues:

ts
Copy code
export const mastra = new Mastra({
  bundler: {
    externals: ["@google/genai"],
  },
});
Build & deploy.

Your live API endpoint will look like:

bash
Copy code
https://howling-squeaking-motherbo.mastra.cloud/a2a/agent/interviewAgent




🧩 Troubleshooting
❌ “Agent with name interview-agent not found”
Check your agent file exports:

ts
Copy code
export const interviewAgent = new Agent({ name: "interview-agent", ... });
❌ “Mastra wasn't able to build your project. Please add @google/genai to your externals.”
Add this to your Mastra config:

ts
Copy code
export const mastra = new Mastra({
  bundler: {
    externals: ["@google/genai"],
  },
});
📜 License
This project is licensed under the MIT License.

<div align="center">
👨‍💻 Author
Mael - Sunny
🌐 Mastra Cloud Deployment
💡 Built during the HNG Internship Program

</div>