import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST(request) {
  await clearSession();

  const response = NextResponse.redirect(new URL('/login', request.url));

  // Jenjang aktif harus dipilih ulang saat login berikutnya.
  response.cookies.set('schoolhub_school_id', '', {
    httpOnly: false,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
