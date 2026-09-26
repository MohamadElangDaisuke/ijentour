import { POST as authLogout } from "@/app/api/auth/logout/route";

export async function POST() {
  return authLogout();
}
