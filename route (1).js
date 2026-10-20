export async function POST(req) {
  const { messages } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { reply: "No OPENAI_API_KEY is set in this deployment's environment variables yet." },
      { status: 200 }
    );
  }

  const systemPrompt = {
    role: "system",
    content:
      "You are Seth, a calm, capable personal voice assistant speaking out loud to one user. " +
      "Keep replies short and conversational since they will be read aloud by text-to-speech: " +
      "2-4 sentences unless the user clearly wants more detail. No markdown, no bullet lists, no emoji. " +
      "You can draft emails or messages on request, but you never claim to have actually sent anything, " +
      "deleted anything, or taken any irreversible action - you only draft, and tell the user it's ready for them to review and send themselves.",
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return Response.json(
      { reply: "The model call failed: " + errText.slice(0, 200) },
      { status: 200 }
    );
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || "I'm not sure how to answer that.";
  return Response.json({ reply });
}
