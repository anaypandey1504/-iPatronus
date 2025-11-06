import { NextResponse } from 'next/server';
import { createSession, getSessions, updateSessionStatus } from '@/lib/utils/fakeDb';

export async function GET() {
  try {
    const sessions = getSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { doctorId, patientId } = await request.json();
    
    if (!doctorId || !patientId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = createSession(doctorId, patientId);
    
    return NextResponse.json({ 
      session,
      roomUrl: `/call/${session.roomId}`
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}