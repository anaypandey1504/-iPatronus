import { NextResponse } from 'next/server';
import { getDoctors, updateDoctorStatus } from '@/lib/utils/fakeDb';

export async function GET() {
  try {
    const doctors = getDoctors();
    if (!doctors.length) {
      return NextResponse.json(
        { message: 'No users available' },
        { status: 404 }
      );
    }
    // Demo: return the first doctor as the current user
    const first = doctors[0];
    return NextResponse.json({
      user: {
        id: first.id,
        name: first.name,
        role: 'DOCTOR',
        status: first.status,
      },
    });
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
    const { status } = await request.json();

    const doctors = getDoctors();
    if (!doctors.length) {
      return NextResponse.json(
        { message: 'No users available' },
        { status: 404 }
      );
    }

    const updated = updateDoctorStatus(doctors[0].id, status);
    if (!updated) {
      return NextResponse.json(
        { message: 'Failed to update user status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        role: 'DOCTOR',
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}