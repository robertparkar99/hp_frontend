// apps/ai/mcp-client/mcpClient.ts

import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import type { QueryBusinessDataInput, McpToolResult } from "./types";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL ?? "http://localhost:3400";

/**
 * Creates a connected MCP client instance.
 * Each call opens a fresh connection — suitable for serverless/API route usage.
 * For long-lived server processes, use the singleton pattern below instead.
 */

export async function createMcpClient() {
  const client = new Client({ name: "bi-mcp-client", version: "1.0.0" });

  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL)
  );

  await client.connect(transport);
  return client;
}

export async function queryBusinessData(
  input: QueryBusinessDataInput
): Promise<any> {
  console.log("[MCP CLIENT] queryBusinessData input:", input);
  const client = await createMcpClient();

  try {
    const result = (await client.callTool({
      name: "queryBusinessData",
      arguments: { ...input },
    })) as McpToolResult;

    console.log("[apps/ai/mcp-client] tool response", {
      isError: result.isError,
      hasStructuredContent: Boolean(result.structuredContent),
      contentText: result.content?.[0]?.text,
    });

    if (result.isError) {
      throw new Error(`MCP tool error: ${result.content[0]?.text}`);
    }

    if (result.structuredContent) {
      return result.structuredContent;
    }

    const text = result.content[0]?.text;
    if (!text) throw new Error("MCP tool returned empty content");

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } finally {
    await client.close();
  }
}

/**
 * Lists all tools, prompts, and resources the MCP server exposes.
 * Useful during development to verify what's available.
 */
export async function discoverMcpCapabilities() {
  const client = await createMcpClient();

  try {
    const [tools, prompts, resources] = await Promise.all([
      client.listTools(),
      client.listPrompts(),
      client.listResources(),
    ]);

    return { tools: tools.tools, prompts: prompts.prompts, resources: resources.resources };
  } finally {
    await client.close();
  }
}
