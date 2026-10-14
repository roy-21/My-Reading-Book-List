import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "reading_room_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "reading-room-secure-session-key-2026-v1";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "ROy";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sojib215@#";

function sign(payload) {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(`${data}.${hmac}`).toString("base64url");
}

function verify(token) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [data, signature] = raw.split(".");
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    if (signature === expected) {
      const parsed = JSON.parse(data);
      if (parsed.exp && parsed.exp > Date.now()) {
        return parsed;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function loginAdmin(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const sessionData = {
      user: username,
      role: "admin",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };
    const token = sign(sessionData);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  }
  return { success: false, error: "Invalid credentials" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const session = verify(token);
    return Boolean(session && session.role === "admin");
  } catch {
    return false;
  }
}
