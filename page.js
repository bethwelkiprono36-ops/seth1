"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [log, setLog] = useState([
    { role: "seth", text: "I'm here. Tap the core, or type below." },
  ]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    recognitionRef.current = recognition;
  }, []);

  function startListening() {
    if (!recognitionRef.current) {
      alert(
        "Your browser doesn't support voice input. Try Chrome or Edge, or just type below."
      );
      return;
    }
    setStatus("listening");
    recognitionRef.current.start();
  }

  async function handleSend(text) {
    if (!text.trim()) return;
    const nextLog = [...log, { role: "you", text }];
    setLog(nextLog);
    setInput("");
    setStatus("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextLog.map((m) => ({
            role: m.role === "you" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I ran into a problem reaching the model.";
      setLog((l) => [...l, { role: "seth", text: reply }]);
      await speak(reply);
    } catch (err) {
      setLog((l) => [
        ...l,
        { role: "seth", text: "Something broke on my end: " + err.message },
      ]);
      setStatus("idle");
    }
  }

  async function speak(text) {
    try {
      setStatus("speaking");
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("tts failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch {
      // Voice is optional; fail silently to text-only.
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.vignette} />

      <header style={styles.header}>
        <span style={styles.wordmark}>SETH</span>
        <span style={styles.statusLabel}>{statusCopy[status]}</span>
      </header>

      <button
        onClick={startListening}
        style={{
          ...styles.core,
          boxShadow: coreGlow[status],
          transform: status === "listening" ? "scale(1.04)" : "scale(1)",
        }}
        aria-label="Talk to Seth"
      >
        <span style={styles.coreInner} />
      </button>

      <section style={styles.log}>
        {log.map((entry, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              alignSelf: entry.role === "you" ? "flex-end" : "flex-start",
              background: entry.role === "you" ? "#1C1823" : "#231A14",
              borderColor: entry.role === "you" ? "#352C3E" : "#4A2E18",
            }}
          >
            <span style={styles.bubbleLabel}>
              {entry.role === "you" ? "you" : "seth"}
            </span>
            <p style={styles.bubbleText}>{entry.text}</p>
          </div>
        ))}
        <div ref={logEndRef} />
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        style={styles.inputRow}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something, or type it instead"
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn}>
          Send
        </button>
      </form>

      <audio ref={audioRef} />
    </main>
  );
}

const statusCopy = {
  idle: "waiting",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
};

const coreGlow = {
  idle: "0 0 40px 6px rgba(232, 98, 44, 0.25)",
  listening: "0 0 70px 18px rgba(242, 166, 90, 0.55)",
  thinking: "0 0 55px 12px rgba(138, 130, 144, 0.45)",
  speaking: "0 0 70px 18px rgba(232, 98, 44, 0.65)",
};

const styles = {
  main: {
    minHeight: "100dvh",
    background: "#0D0B10",
    color: "#EDE6DD",
    fontFamily:
      "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 20px 16px",
    position: "relative",
    overflow: "hidden",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 50% 20%, rgba(232,98,44,0.08), transparent 60%)",
    pointerEvents: "none",
  },
  header: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    zIndex: 1,
  },
  wordmark: {
    fontSize: 15,
    letterSpacing: "0.15em",
    fontWeight: 600,
    color: "#F2A65A",
  },
  statusLabel: {
    fontSize: 13,
    color: "#8A8290",
  },
  core: {
    marginTop: 36,
    marginBottom: 20,
    width: 150,
    height: 150,
    borderRadius: "50%",
    border: "1px solid rgba(242,166,90,0.3)",
    background:
      "radial-gradient(circle at 35% 30%, #F2A65A, #E8622C 55%, #5A2A12 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.4s ease",
    zIndex: 1,
  },
  coreInner: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#0D0B10",
  },
  log: {
    width: "100%",
    maxWidth: 480,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    paddingBottom: 12,
    zIndex: 1,
  },
  bubble: {
    maxWidth: "85%",
    border: "1px solid",
    borderRadius: 14,
    padding: "8px 12px",
  },
  bubbleLabel: {
    fontSize: 10,
    letterSpacing: "0.1em",
    color: "#8A8290",
  },
  bubbleText: {
    margin: "4px 0 0",
    fontSize: 14.5,
    lineHeight: 1.45,
    color: "#EDE6DD",
  },
  inputRow: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    gap: 8,
    zIndex: 1,
  },
  input: {
    flex: 1,
    background: "#17141C",
    border: "1px solid #2A2430",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#EDE6DD",
    fontSize: 14.5,
    outline: "none",
  },
  sendBtn: {
    background: "#E8622C",
    color: "#0D0B10",
    border: "none",
    borderRadius: 10,
    padding: "0 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
