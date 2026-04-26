/**
 * Bilingual error/message resolver — Critical Rule #1.
 *
 * Loads `src/i18n/{en,fr}.json` at module init and exposes `t(key, locale)`.
 * Locale fallback : if a key is missing in `fr`, fall back to `en`.
 */
import en from "../i18n/en.json" with { type: "json" };
import fr from "../i18n/fr.json" with { type: "json" };

export type Locale = "en" | "fr";

const TABLES: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  fr: fr as Record<string, string>,
};

export function t(key: string, locale: Locale = "en"): string {
  const table = TABLES[locale] ?? TABLES.en;
  return table[key] ?? TABLES.en[key] ?? key;
}

export function listKeys(locale: Locale): string[] {
  return Object.keys(TABLES[locale] ?? {}).sort();
}

/**
 * Detect the requested locale from an MCP request header.
 * Honours `X-MCP-Locale: fr` (or `en`); falls back to `en`.
 */
export function detectLocaleFromHeader(
  header: string | string[] | undefined,
): Locale {
  const raw = Array.isArray(header) ? header[0] : header;
  if (typeof raw !== "string") return "en";
  const v = raw.trim().toLowerCase();
  if (v.startsWith("fr")) return "fr";
  return "en";
}
