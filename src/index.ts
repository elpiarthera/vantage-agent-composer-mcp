#!/usr/bin/env node
/**
 * Entry point — @vantageos/mcp-agent-composer
 *
 * Boots the MCP server over stdio transport (Critical Rule #7).
 */
import { createServer } from "./server.js";
import { logger } from "./lib/logger.js";

async function main(): Promise<void> {
  const server = createServer();
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  logger.error({
    msg: "fatal_boot_error",
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
