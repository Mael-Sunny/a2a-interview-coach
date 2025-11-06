// src/mastra/index.ts
import 'dotenv/config';
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { interviewAgent } from "./agents/interview-agent.js";
import { a2aAgentRoute } from "./routes/a2a-agent-route.js";


export const mastra = new Mastra({
  agents: { interviewAgent },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new PinoLogger({ name: "Mastra", level: "debug" }),
  observability: { default: { enabled: true } },
  server: {
    build: { openAPIDocs: true, swaggerUI: true },
    apiRoutes: [a2aAgentRoute],
  },
});

console.log("✅ Mastra server initialized successfully");

