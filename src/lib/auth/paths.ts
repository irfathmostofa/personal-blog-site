export const ADMIN_LOGIN_PATH = "/admin";
export const ADMIN_DASHBOARD_PATH = "/admin/dashboard";

const STAFF_PREFIX = "/admin/";

/**
 * Only allow in-app admin paths as post-login destinations.
 * Rejects protocol-relative URLs, other origins, and the login screen itself.
 */
export function safeAdminNext(value: unknown): string {
  if (typeof value !== "string") return ADMIN_DASHBOARD_PATH;

  const path = value.trim();
  if (path.length === 0 || path.length > 512) return ADMIN_DASHBOARD_PATH;
  if (path.startsWith("//") || path.includes("://") || path.includes("\\")) {
    return ADMIN_DASHBOARD_PATH;
  }

  const bare = path.includes("?") ? path.slice(0, path.indexOf("?")) : path;
  if (bare === ADMIN_LOGIN_PATH || bare === `${ADMIN_LOGIN_PATH}/`) {
    return ADMIN_DASHBOARD_PATH;
  }
  if (!bare.startsWith(STAFF_PREFIX)) return ADMIN_DASHBOARD_PATH;

  return path;
}

export function loginRedirect(next?: string | null): string {
  const destination = safeAdminNext(next);
  if (destination === ADMIN_DASHBOARD_PATH) return ADMIN_LOGIN_PATH;
  return `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(destination)}`;
}
