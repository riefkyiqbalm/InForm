import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Akses tidak sah' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      institution: user.institution,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[API /auth/me] ', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Akses tidak sah' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { contact = '', institution = '', role = '' } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        contact: contact || null,
        institution: institution || null,
        role: role || null,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      contact: updatedUser.contact || '',
      institution: updatedUser.institution || '',
      role: updatedUser.role || '',
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error('[API /auth/me PUT] ', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
