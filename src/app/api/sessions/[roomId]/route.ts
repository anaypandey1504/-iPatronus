import prisma from '@/lib/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { roomId: params.roomId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { status } = await request.json();

    const session = await prisma.session.update({
      where: { roomId: params.roomId },
      data: { status },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}