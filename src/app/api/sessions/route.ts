import prisma from '@/lib/utils/db';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(request: Request) {
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

    const { patientId, accepted } = await request.json();

    if (!accepted) {
      const session = await prisma.session.create({
        data: {
          doctorId: decoded.id,
          patientId,
          roomId: uuidv4(),
          status: 'REJECTED',
        },
      });

      return NextResponse.json({ session });
    }

    const session = await prisma.session.create({
      data: {
        doctorId: decoded.id,
        patientId,
        roomId: uuidv4(),
        status: 'ACCEPTED',
      },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}