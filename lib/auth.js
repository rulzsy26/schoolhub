import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "schoolhub_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-secret",
);

export async function createSession(user) {
  return new SignJWT({
    id_user: user.id_user,
    role: user.role,
    nama_lengkap: user.nama_lengkap,
    username: user.username,
    email: user.email,
    jenjang: user.jenjang,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSession(user) {
  const token = await createSession(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
