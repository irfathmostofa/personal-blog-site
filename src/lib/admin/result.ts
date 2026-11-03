export type ActionResult<T = undefined> =
  | { status: "success"; message: string; data: T }
  | { status: "error"; message: string };

export function fail(message: string): { status: "error"; message: string } {
  return { status: "error", message };
}
