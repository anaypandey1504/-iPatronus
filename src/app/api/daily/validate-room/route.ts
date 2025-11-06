import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ message: 'Missing room name' }, { status: 400 });
    }

    const res = await fetch(`${DAILY_API_URL}/rooms/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    const room = await res.json();
    return NextResponse.json({ exists: true, room });
  } catch (error) {
    console.error('Error validating Daily room:', error);
    return NextResponse.json({ message: 'Validation failed' }, { status: 500 });
  }
}
