/**
 * Structured JSON logger.
 *
 * Per spec §4.bis : { level, tool, duration_ms, error, request_id }.
 * No user data by default ; opt-in debug via DEBUG=vantage-agent-composer:* env var.
 * No raw stack traces leak to client (Critical Rule #6).
 * Writes to stderr to avoid corrupting stdio MCP framing on stdout.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
  level: LogLevel;
  tool?: string;
  duration_ms?: number;
  error?: string;
  request_id?: string;
  msg?: string;
  [key: string]: unknown;
}

const ENABLED = process.env["DEBUG"]?.includes("vantage-agent-composer") ?? false;
const LEVEL: LogLevel = (process.env["LOG_LEVEL"] as LogLevel) ?? "info";

const ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldEmit(level: LogLevel): boolean {
  if (level === "debug" && !ENABLED) return false;
  return ORDER[level] >= ORDER[LEVEL];
}

function emit(record: LogRecord): void {
  if (!shouldEmit(record.level)) return;
  process.stderr.write(`${JSON.stringify({ ts: new Date().toISOString(), ...record })}\n`);
}

export const logger = {
  debug: (record: Omit<LogRecord, "level">) => emit({ ...record, level: "debug" }),
  info: (record: Omit<LogRecord, "level">) => emit({ ...record, level: "info" }),
  warn: (record: Omit<LogRecord, "level">) => emit({ ...record, level: "warn" }),
  error: (record: Omit<LogRecord, "level">) => emit({ ...record, level: "error" }),
};
