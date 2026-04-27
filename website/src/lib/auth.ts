import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Gunakan satu konstanta yang pasti terisi
export const AUTH_SECRET = process.env.JWT_SECRET! ;

export function generateToken(userId: any, email: string): string {
  // console.log("--- GENERATING TOKEN ---");
  // console.log("Using Secret (first 5 chars):", AUTH_SECRET.substring(0, 5));
  
  return jwt.sign(
    { userId: userId.toString(), email },
    AUTH_SECRET,
    { expiresIn: "7d" }
  );
}

export function getUserFromToken(token: string) {
  // LOG INI AKAN MUNCUL DI TERMINAL VS CODE
  // console.log("DEBUG: Secret yang dipakai verifikasi:", process.env.JWT_SECRET);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return (decoded as any).userId;
  } catch (err: any) {
    console.error("ALASAN VERIFIKASI GAGAL:", err.message);
    return null;
  }
}


// ── 2. Password Helpers (For Traditional Login/Register) ─────────────────────

/**
 * Hashes a plain text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    console.error("[Auth] Password verification error:", err);
    return false;
  }
}