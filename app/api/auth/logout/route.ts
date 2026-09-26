import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil logout.",
  });

  response.cookies.delete("auth_token");
  response.cookies.delete("admin_token");

  return response;
}
