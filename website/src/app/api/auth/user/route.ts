import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Akses tidak sah' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    // Karena skema kamu memiliki onDelete: Cascade, 
    // menghapus User akan otomatis menghapus semua ChatSession miliknya.
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat menghapus akun' }, { status: 500 });
  }
}