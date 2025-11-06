import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import CallClient from './CallClient';

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ room: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { room } = await params;
  const { url: roomUrl } = await searchParams;

  // Build absolute base URL for internal fetches
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;

  try {
    // If we already have a full Daily room URL, skip validation
    if (roomUrl) {
      return <CallClient room={room} roomUrl={roomUrl} />;
    }

    // Validate room existence with Daily via our API
    const validateRes = await fetch(
      `${base}/api/daily/validate-room?name=${encodeURIComponent(room)}`,
      { cache: 'no-store' }
    );

    if (validateRes.status === 404) {
      // Create a new room if not found, then redirect
      const createRes = await fetch(`${base}/api/daily/create-room`, {
        method: 'POST',
        cache: 'no-store',
      });
      if (!createRes.ok) {
        throw new Error('Failed to create Daily room');
      }
      const data = await createRes.json();
      const newName: string | undefined = data?.room?.name;
      if (!newName) throw new Error('Daily room name missing');
      redirect(`/call/${newName}`);
    }

    if (!validateRes.ok) {
      throw new Error('Failed to validate Daily room');
    }

    // Room exists; prefer the exact URL from Daily validation response
    const validated = await validateRes.json();
    const validatedUrl: string | undefined = validated?.room?.url;
    return <CallClient room={room} roomUrl={validatedUrl} />;
  } catch (e) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto" />
          <p className="text-lg">Unable to start meeting, please retry.</p>
        </div>
      </div>
    );
  }
}