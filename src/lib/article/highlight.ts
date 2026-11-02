function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function highlightMatches(text: string, query: string): string {
  const escaped = escapeHtml(text);
  const trimmed = query.trim();
  if (!trimmed) return escaped;

  const pattern = new RegExp(
    `(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig",
  );
  return escaped.replace(pattern, "<mark>$1</mark>");
}
