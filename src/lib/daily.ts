const DAILY_API_KEY = process.env.DAILY_API_KEY || 'YOUR_DAILY_API_KEY';
const DAILY_API_URL = 'https://api.daily.co/v1';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
}

export async function createDailyRoom(): Promise<DailyRoom> {
  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          enable_network_ui: true,
          enable_screenshare: false,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Daily room');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      url: data.url,
    };
  } catch (error) {
    console.error('Error creating Daily room:', error);
    throw error;
  }
}