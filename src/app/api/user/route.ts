import prisma from '@/lib/utils/db';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request: Request) {
  try {
     const headersList = await headers();
     const cookie = headersList.get('cookie') || '';
     const token = cookie.split('token=')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
     const headersList = await headers();
     const cookie = headersList.get('cookie') || '';
     const token = cookie.split('token=')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}