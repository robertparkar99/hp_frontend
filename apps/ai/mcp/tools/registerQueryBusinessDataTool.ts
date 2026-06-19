import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { queryBusinessDataSchema } from "./queryBusinessData";
import { handleQueryBusinessData } from "./queryBusinessDataHandler";

export function registerQueryBusinessDataTool(
  server: Pick<McpServer, "registerTool">
) {
  server.registerTool(
    "queryBusinessData",
    {
      description:
        "Query leave management BI data for leave risk, Monday/Friday patterns, unplanned leave, clustering, employee frequency, consumed days, department burden, leave type utilization, entitlement consumption, leave balance risk, leave type exhaustion, department leave risk, and department unplanned leave.",
      inputSchema: queryBusinessDataSchema.shape,
    },
    async (args) => {
      const input = queryBusinessDataSchema.parse(args);
      return handleQueryBusinessData(input);
    }
  );
}