import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  const loginUrl = new URL("/login", req.url);

  if (!token) {
    loginUrl.searchParams.set("error", "InvalidLink");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        contact: true,
        institution: true,
        role: true,
        createdAt: true,
        tokenExpiry: true,
        emailVerified: true,
      },
    });

    if (!user || !user.emailVerified || !user.tokenExpiry || user.tokenExpiry < new Date()) {
      loginUrl.searchParams.set("error", "ExpiredLink");
      return NextResponse.redirect(loginUrl);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken: null, tokenExpiry: null },
    });

    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const userData = JSON.stringify({
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      image: user.image ?? "",
      contact: user.contact ?? "",
      institution: user.institution ?? "",
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });

    const cookieOpts = "Path=/; Max-Age=604800; SameSite=Lax";
    const redirectUrl = new URL(`/chat/${user.id}`, req.url);

    const response = NextResponse.redirect(redirectUrl);
    response.headers.append("Set-Cookie", `_auth_token=${jwtToken}; ${cookieOpts}`);
    response.headers.append(
      "Set-Cookie",
      `_auth_user=${encodeURIComponent(userData)}; ${cookieOpts}`
    );

    return response;
  } catch (error) {
    console.error("[GET /api/auth/verify-login-link]", error);
    loginUrl.searchParams.set("error", "ServerError");
    return NextResponse.redirect(loginUrl);
  }
}
