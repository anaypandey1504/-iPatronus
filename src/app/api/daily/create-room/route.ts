import { NextResponse } from 'next/server';
import { createDailyRoom } from '@/lib/daily';

export async function POST() {
  try {
    const room = await createDailyRoom();
    return NextResponse.json({ room });
  } catch (error: any) {
    console.error('Error creating Daily room:', error);
    return NextResponse.json(
      { message: 'Failed to create Daily room' },
      { status: 500 }
    );
  }
}
