import { hashPassword } from '@/lib/utils/auth';
import prisma from '@/lib/utils/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        status: 'NOT_AVAILABLE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}