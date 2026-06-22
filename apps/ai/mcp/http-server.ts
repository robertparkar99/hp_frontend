import { createServer, IncomingMessage } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { checkMariaDbHealth } from "./datasource/mariadb";
import { registerQueryBusinessDataTool } from "./tools/registerQueryBusinessDataTool";

async function readJsonBody(request: IncomingMessage) {
  if (request.method !== "POST" && request.method !== "PUT" && request.method !== "PATCH") {
    return undefined;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const bodyText = Buffer.concat(chunks).toString("utf-8");
  if (!bodyText.trim()) {
    return undefined;
  }

  return JSON.parse(bodyText);
}

export async function startMCPServer() {
  const server = new McpServer({
    name: "bi-mcp-server",
    version: "1.0.0"
  });

  const PORT = Number(process.env.MCP_PORT || 3400);
  const strictHealthCheck = ["1", "true", "yes", "on"].includes(
    String(process.env.DB_HEALTHCHECK_STRICT || "").trim().toLowerCase()
  );

  registerQueryBusinessDataTool(server);

  const health = await checkMariaDbHealth();
  if (health.ok) {
    console.log("[mariadb] Health check passed", health);
  } else {
    console.error("[mariadb] Health check failed", health);
    if (strictHealthCheck) {
      throw new Error(
        `MariaDB health check failed during startup (${health.failureType || "unknown"}).`
      );
    }
  }

  const httpServer = createServer((req, res) => {
    void (async () => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);

      const body = await readJsonBody(req);
      await transport.handleRequest(req, res, body);
    })().catch((error) => {
      console.error("MCP HTTP server error:", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, resolve);
  });

  console.log(`MCP server listening on http://localhost:${PORT}`);
}

startMCPServer().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
