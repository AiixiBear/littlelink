import type { Locale } from "../data/languages";

// A content field that is either one string for every language or a
// per-locale object. Used by the inspiration and links collections.
export type LocalizedText =
  | string
  | {
      "zh-tw"?: string;
      en?: string;
      ja?: string;
    };

// Resolve a LocalizedText for a locale; a missing locale falls back
// to zh-tw, then en, then ja.
export function pickLocalizedText(
  text: LocalizedText | undefined,
  locale: Locale,
): string | undefined {
  if (!text) return undefined;
  if (typeof text === "string") return text;
  return text[locale] ?? text["zh-tw"] ?? text.en ?? text.ja;
}
