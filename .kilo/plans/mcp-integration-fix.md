# MCP Integration Fix Plan

## Problem Summary
The MCP client (`apps/ai/mcp-client/mcpClient.ts`) is never called in the main chat flow. Instead, `api-handler.ts` uses direct fetch to `/api/mcp/queryBusinessData`, bypassing the MCP SDK entirely. The `sqlGenerator` flow is also unreachable.

## Root Causes
1. **Path isolation**: MCP client lives in `apps/ai/` but isn't accessible from `src/` via `@/lib` aliases
2. **No MCP client import**: `api-handler.ts` uses `fetch()` instead of `queryBusinessData()` function
3. **Disconnected flows**: `apps/ai/src/flows/sqlGenerator.ts` imports MCP client but is never invoked

## Solution Steps

### Step 1: Create Shared MCP Client Module
**Action**: Create `src/lib/mcp-client.ts` that re-exports from `apps/ai/mcp-client/mcpClient.ts`

```typescript
// src/lib/mcp-client.ts (NEW FILE)
export { queryBusinessData, createMcpClient, discoverMcpCapabilities } from '../apps/ai/mcp-client/mcpClient';
export type { BusinessIntent, QueryBusinessDataInput, McpToolResult } from '../apps/ai/mcp-client/types';
```

### Step 2: Update api-handler.ts to Use MCP Client
**File**: `src/app/api-handler.ts` (lines ~811-879)

**Changes**:
- Add import: `import { queryBusinessData } from "@/lib/mcp-client";`
- Replace direct fetch to `/api/mcp/queryBusinessData` with MCP client call

```typescript
// BEFORE (line 830-837):
const mcpResponse = await fetch(
  new URL('/api/mcp/queryBusinessData', baseUrl).toString(),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }
);
const mcpData = await mcpResponse.json();

// AFTER:
const mcpData = await queryBusinessData({
  intent: 'leave_pattern_anomaly',
  employee_id: requestBody.employee_id || request.userId,
  start_date: requestBody.startDate,
  end_date: requestBody.endDate
});
```

### Step 3: Verify MCP Tool Integration
**File**: `src/app/api/mcp/queryBusinessData/route.ts` (already exists and working)

This Next.js API route already handles the MCP tool invocation correctly:
- Connects to MariaDB via pool
- Executes leave pattern queries
- Returns structured JSON

The MCP client should point to this endpoint: `http://localhost:3000/api/mcp` (default already correct)

### Step 4: (Optional) Integrate sqlGenerator Flow
If you want to use the Genkit-based `sqlGeneratorFlow`:

1. Add route handler at `src/app/api/sqlgenerator/route.ts` to invoke the flow
2. Or integrate directly into `api-handler.ts` for intents that need AI-enhanced responses

## Implementation Priority

| Priority | Task | Impact |
|----------|------|--------|
| 1 | Create `src/lib/mcp-client.ts` wrapper | Unblocks MCP client usage from src/ |
| 2 | Update `api-handler.ts` to use MCP client | Fixes the main integration gap |
| 3 | Test leave pattern analysis flow | Verify end-to-end MCP functionality |
| 4 | Integrate sqlGenerator if needed | Adds AI-powered MCP responses |

## Expected Outcome
After Step 2:
- User query "Show leave abuse risk for employee X" → `ChatbotCopilot.tsx` → `/api/chat` → `api-handler.ts` → MCP client → `/api/mcp/queryBusinessData` → Database → Response → Chat UI

## Files to Modify
1. `src/lib/mcp-client.ts` (CREATE)
2. `src/app/api-handler.ts` (MODIFY - add import + replace fetch)