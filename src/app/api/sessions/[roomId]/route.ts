import { NextResponse } from 'next/server';
import { getSessionByRoomId, updateSessionStatus } from '@/lib/utils/fakeDb';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = getSessionByRoomId(params.roomId);

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
    const current = getSessionByRoomId(params.roomId);
    if (!current) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    const updated = updateSessionStatus(current.id, status);
    if (!updated) {
      return NextResponse.json(
        { message: 'Failed to update session' },
        { status: 400 }
      );
    }

    return NextResponse.json({ session: updated });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}