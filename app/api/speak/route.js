export async function POST(req) {
  const { text } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !text) {
    return new Response(null, { status: 204 });
  }

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "onyx", // deepest male voice OpenAI offers
      input: text,
    }),
  });

  if (!res.ok) {
    return new Response(null, { status: 204 });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
