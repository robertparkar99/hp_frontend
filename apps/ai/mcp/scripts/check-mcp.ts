// scripts/check-mcp.ts

import { discoverMcpCapabilities } from "../../mcp-client/mcpClient";

async function main() {
  console.log("Connecting to MCP server...\n");

  const { tools, prompts, resources } = await discoverMcpCapabilities();

  console.log("=== TOOLS ===");
  tools.forEach(t => console.log(`  ✓ ${t.name}: ${t.description}`));

  console.log("\n=== PROMPTS ===");
  prompts.forEach(p => console.log(`  ✓ ${p.name}`));

  console.log("\n=== RESOURCES ===");
  resources.forEach(r => console.log(`  ✓ ${r.name} → ${r.uri}`));
}

main().catch(console.error);