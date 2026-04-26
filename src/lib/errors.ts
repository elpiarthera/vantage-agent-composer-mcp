/**
 * Typed error helpers — wraps MCP SDK McpError when available, otherwise a
 * plain Error with `code` so tests can introspect without depending on the SDK.
 *
 * Critical Rule #6 : never expose stack traces to the client.
 */
import { t, type Locale } from "./i18n.js";

export type ErrorCode =
  | "INVALID_PARAMS"
  | "ROLE_NOT_FOUND"
  | "PERSONA_NOT_FOUND"
  | "FRAMEWORK_NOT_FOUND"
  | "CONTEXT_TOO_SHORT"
  | "GOAL_TOO_SHORT"
  | "TOO_MANY_SKILLS"
  | "INVALID_ROLE_CATEGORY"
  | "INVALID_PERSONA_AXIS"
  | "INVALID_FORMAT"
  | "INTERNAL_ERROR";

const CODE_TO_KEY: Record<ErrorCode, string> = {
  INVALID_PARAMS: "error.invalid_params",
  ROLE_NOT_FOUND: "error.role_not_found",
  PERSONA_NOT_FOUND: "error.persona_not_found",
  FRAMEWORK_NOT_FOUND: "error.framework_not_found",
  CONTEXT_TOO_SHORT: "error.context_too_short",
  GOAL_TOO_SHORT: "error.goal_too_short",
  TOO_MANY_SKILLS: "error.too_many_skills",
  INVALID_ROLE_CATEGORY: "error.invalid_role_category",
  INVALID_PERSONA_AXIS: "error.invalid_persona_axis",
  INVALID_FORMAT: "error.invalid_format",
  INTERNAL_ERROR: "error.internal",
};

export class ComposerError extends Error {
  public readonly code: ErrorCode;
  public readonly locale: Locale;
  public readonly data?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    locale: Locale = "en",
    data?: Record<string, unknown>,
  ) {
    super(t(CODE_TO_KEY[code], locale));
    this.code = code;
    this.locale = locale;
    if (data !== undefined) this.data = data;
    this.name = "ComposerError";
  }
}

/**
 * Convenience alias to mirror MCP SDK naming. The MCP SDK exports `McpError`;
 * we wrap it transparently so callers using `McpError.toString()` see the
 * localized message without leaking `cause`/stack.
 */
export const McpError = ComposerError;
