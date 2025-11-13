import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "aidfusion_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("Missing JWT_SECRET environment variable.");
}

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function createSession(payload: TokenPayload) {
  const token = jwt.sign(payload, secret, { expiresIn: MAX_AGE });
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

