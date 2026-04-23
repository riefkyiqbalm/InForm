// lib/auth.ts
import jwt from "jsonwebtoken";

// BUG FIX — original returned `string` but Prisma IDs can be `number` (Int)
// or `string` (cuid/uuid) depending on your schema. Using `string | number`
// here and letting callers cast means the function works for both schema types.
export function getUserFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string | number;
    };
    // Normalise to string so Prisma `where: { id: userId }` always works when
    // the schema uses String IDs (cuid/uuid). For Int IDs, cast to Number in
    // the route: `Number(getUserFromToken(token))`.
    return decoded.userId?.toString() ?? null;
  } catch {
    return null;
  }
}