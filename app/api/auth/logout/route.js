import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  // Hapus cookie autentikasi
  response.cookies.delete("token");
  response.cookies.delete("session");
  response.cookies.delete("schoolhub_session");

  // Hapus cookie sekolah aktif
  response.cookies.delete("schoolhub_school_id");

  return response;
}
