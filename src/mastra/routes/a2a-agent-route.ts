import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

// Strong response type to handle different Mastra/Gemini variants
type AgentResponse = {
  text?: string;
  response?: { text?: () => string };
  toolResults?: any[];
  output_text?: string;
};

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    const start = Date.now();

    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");
      const body = await c.req.json();

      // 🔒 Validate JSON-RPC structure
      if (!body?.jsonrpc || body.jsonrpc !== "2.0" || !body.id) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: body?.id ?? null,
            error: { code: -32600, message: "Invalid JSON-RPC request." },
          },
          400
        );
      }

      // 🔍 Fetch target agent
      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32601, message: `Agent '${agentId}' not found.` },
          },
          404
        );
      }

      const params = body.params || {};
      const { message, messages, contextId, taskId } = params;

      // Normalize messages
      const messagesList = message
        ? [message]
        : Array.isArray(messages)
        ? messages
        : [];

      // Convert A2A message format → Mastra agent message format
      const mastraMessages = messagesList.map((msg: any) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((p: any) =>
              p.kind === "text"
                ? p.text
                : p.kind === "data"
                ? JSON.stringify(p.data)
                : ""
            )
            .join("\n") || "",
      }));

      // 🧠 Call agent
      const response = (await agent.generate(mastraMessages)) as AgentResponse;

      // 🔤 Safely extract text output from various SDK response structures
      let text = "";
      if (typeof response.text === "string") {
        text = response.text;
      } else if (typeof response.response?.text === "function") {
        text = response.response.text();
      } else if (typeof response.output_text === "string") {
        text = response.output_text;
      } else {
        text = "No response generated.";
      }

      const toolResults = response.toolResults || [];

      // 📦 Create A2A artifacts
      const artifacts: any[] = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: "text", text }],
        },
      ];

      if (toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          parts: toolResults.map((t: any) => ({ kind: "data", data: t })),
        });
      }

      // 🕓 Build message history
      const history = [
        ...messagesList.map((msg: any) => ({
          kind: "message",
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: "message",
          role: "agent",
          parts: [{ kind: "text", text }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        },
      ];

      const duration = Date.now() - start;
      console.log(`[A2A] ${agentId} handled request in ${duration}ms`);

      // ✅ Return full A2A-compliant JSON-RPC response
      return c.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text }],
              kind: "message",
            },
          },
          artifacts,
          history,
          kind: "task",
        },
      });
    } catch (error: any) {
      console.error("A2A route error:", error);

      // 🧯 Graceful JSON-RPC error response
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal Server Error",
            data: error?.message || String(error),
          },
        },
        500
      );
    }
  },
});
