import { NextResponse } from 'next/server';
import { getDoctors, updateDoctorStatus } from '@/lib/utils/fakeDb';

export async function GET() {
  try {
    const doctors = getDoctors();
    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { doctorId, status } = await request.json();
    
    if (!doctorId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedDoctor = updateDoctorStatus(doctorId, status);
    
    if (!updatedDoctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}