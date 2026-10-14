/**
 * Deterministic slug generator supporting Latin and Unicode (Bengali) scripts.
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .trim()
    .toLowerCase()
    // Replace whitespace and punctuation with dashes, preserving Bengali and alphanumeric characters
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, "");
}
