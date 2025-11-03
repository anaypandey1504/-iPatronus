import prisma from '@/lib/utils/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ doctors });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}