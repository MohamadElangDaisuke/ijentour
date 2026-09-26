import { POST as authLogin } from "@/app/api/auth/login/route";

export async function POST(request: Request) {
  return authLogin(request);
}
