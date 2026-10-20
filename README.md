# Seth

A voice assistant you talk to in the browser. Tap the core or type, Seth
replies, and you hear it back in a deep voice (OpenAI's `onyx` TTS voice).

## What this actually is

A Next.js web app. That means:

- It works great as a tab or an "Add to Home Screen" shortcut on your phone.
- It **cannot** keep running once you close it, place phone calls, read your
  texts, or bypass any security software on your phone. No web app can do
  those things — they require native OS-level access Apple/Google don't grant
  to browser pages, by design.
- It never sends an email, deletes a file, or does anything irreversible on
  its own. It drafts things and tells you so you can send them yourself. If
  you want real email automation (read/draft/send through your own Gmail
  account with OAuth), that's a reasonable next step to add — ask and we can
  wire it in with proper per-action confirmation.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and add your own OpenAI API key
npm run dev
```

Open http://localhost:3000, allow microphone access, and talk.

## Deploy: GitHub → Vercel

1. Create a new repo on GitHub and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Seth"
   git branch -M main
   git remote add origin https://github.com/<you>/seth.git
   git push -u origin main
   ```
2. Go to vercel.com, "Add New Project," import the `seth` repo.
3. In the Vercel project's Settings → Environment Variables, add:
   - `OPENAI_API_KEY` = your own OpenAI key
4. Deploy. Vercel gives you a URL — open that on your phone and "Add to Home
   Screen" for an app-like icon.

## Cost

This uses your own OpenAI API key, billed directly by OpenAI at their rates
(`gpt-4o-mini` for chat, `tts-1` for voice). There's no subscription layer in
this code — it's just your key, your usage, your bill.

## Extending it

Reasonable next additions, each doable with proper confirmation steps:
- Gmail integration (OAuth) to draft and, after your review, send email.
- Google Calendar to create events on request.
- SMS/call alerts via Twilio, so Seth can text or call *you* with a reminder
  (not a replacement for phone control, but the real version of "let it call
  my phone").
