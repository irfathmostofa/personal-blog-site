export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0] || undefined;
  return value || undefined;
}

export function pageParam(value: string | string[] | undefined, fallback = 1) {
  return Math.max(1, Number(firstParam(value) ?? String(fallback)) || fallback);
}
