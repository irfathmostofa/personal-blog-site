export { getStaffSession, requireStaff, requireAdmin } from "@/lib/auth/session";
export type { StaffProfile, StaffSession } from "@/lib/auth/types";
export {
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
  loginRedirect,
  safeAdminNext,
} from "@/lib/auth/paths";
