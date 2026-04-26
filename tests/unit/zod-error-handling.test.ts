import { describe, test, expect } from "vitest";
import { z } from "zod";
import { TOOLS } from "../../src/server.js";
import { ComposerError } from "../../src/lib/errors.js";

/**
 * Simulates the central server CallTool handler path :
 *   1. inputSchema.parse(args) → ZodError → readable Validation error isError
 *   2. handler(parsed) → ComposerError → isError | success → content+structuredContent
 *
 * Mirrors src/server.ts CallToolRequestSchema branch so unit tests exercise the
 * same wrapping logic that the MCP transport will hit at runtime.
 */
async function callTool(
  name: string,
  args: unknown,
): Promise<{
  isError?: boolean;
  content: Array<{ type: string; text: string }>;
  structuredContent?: unknown;
}> {
  const target = TOOLS.find((t) => t.name === name);
  if (!target) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  }
  let validated: unknown;
  try {
    validated = target.inputSchema.parse(args);
  } catch (e) {
    if (e instanceof z.ZodError) {
      const msg = e.errors
        .map((err) => `${err.path.join(".") || "<root>"}: ${err.message}`)
        .join("; ");
      return {
        isError: true,
        content: [{ type: "text", text: `Validation error: ${msg}` }],
      };
    }
    throw e;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = await (target.handler as (i: any) => Promise<unknown>)(
      validated,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(out) }],
      structuredContent: out,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.errors
        .map((e) => `${e.path.join(".") || "<root>"}: ${e.message}`)
        .join("; ");
      return {
        isError: true,
        content: [{ type: "text", text: `Validation error: ${msg}` }],
      };
    }
    if (err instanceof ComposerError) {
      return {
        isError: true,
        content: [{ type: "text", text: err.message }],
      };
    }
    return {
      isError: true,
      content: [{ type: "text", text: "Internal error" }],
    };
  }
}

describe("zod-error-handling — readable Validation errors via isError", () => {
  test("compose_agent returns isError on invalid role_id", async () => {
    const result = await callTool("compose_agent", {
      role_id: "invented-role",
      persona_id: "direct-pragmatist",
      context: "A 20+ char context string here for valid context length",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/role_id/);
    expect(result.content[0].text).toMatch(/Validation error/);
  });

  test("suggest_composition returns isError when goal too short (<20 chars)", async () => {
    const result = await callTool("suggest_composition", {
      goal: "short",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/goal/);
  });

  test("compose_agent succeeds on valid input", async () => {
    const result = await callTool("compose_agent", {
      role_id: "technical-architect",
      persona_id: "direct-pragmatist",
      framework_id: "first-principles",
      context: "A 20+ char context string here for valid input",
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toBeDefined();
  });
});
