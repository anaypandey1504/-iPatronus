import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🎥 [Daily] Creating new room...");
    console.log(
      "🔐 [Daily] API key present:",
      Boolean(process.env.DAILY_API_KEY)
    );

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600,
        },
      }),
    });

    const data = await res.json();
    console.log("🎥 [Daily] API response:", data);

    if (!res.ok || !data?.url) {
      console.error("❌ [Daily] Room creation failed or URL missing:", data);
      return NextResponse.json(
        { error: data?.error || "Room creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.url, name: data.name });
  } catch (err) {
    console.error("💥 [Daily] Exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
