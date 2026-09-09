import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { Markdown } from "../../components/Markdown";

export const Route = createFileRoute("/_protected/ai-coach")({
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, isLoading, error, stop, clear } = useChat({
    connection: fetchServerSentEvents("/api/ai/chat"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const quickPrompts = [
    "Buatkan plan arm 3 hari pemula",
    "Variasi leg level medium apa saja?",
    "Tips jaga streak tanpa patah",
    "Pemanasan 5 menit sebelum latihan",
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>FitHome AI Coach</h1>
        <Link to="/dashboard" style={{ fontSize: 13, textDecoration: "underline" }}>← Dashboard</Link>
      </div>
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
        Powered by TanStack AI + OpenRouter ({process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini"}). Tanya seputar latihan, streak, atau variasi.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => !isLoading && sendMessage(p)}
            style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16, background: "#fafafa" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>
            <p style={{ fontSize: 32 }}>🤖</p>
            <p>Belum ada chat. Coba tanya quick prompt di atas.</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: m.role === "assistant" ? "#fff" : "#111",
              color: m.role === "assistant" ? "#111" : "#fff",
              border: m.role === "assistant" ? "1px solid #e5e7eb" : "none",
              maxWidth: "85%",
              marginLeft: m.role === "assistant" ? 0 : "auto",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>
              {m.role === "assistant" ? "AI Coach" : "Kamu"}
            </div>
            {m.parts.map((part: any, i: number) => {
              if (part.type === "thinking") return <div key={i} style={{ fontSize: 12, fontStyle: "italic", opacity: 0.6, marginBottom: 6 }}>💭 {part.content}</div>;
              if (part.type === "text") {
                // plain markdown -> React via Bun 1.3.8+ unstable + fallback tanpa deps
                return <div key={i}><Markdown content={part.content} /></div>;
              }
              return null;
            })}
          </div>
        ))}
        {isLoading && <p style={{ fontSize: 12, opacity: 0.6 }}>AI mengetik...</p>}
      </div>

      {error && (
        <div style={{ marginTop: 8, padding: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
          Error: {error.message.includes("OPENROUTER_API_KEY") ? "OPENROUTER_API_KEY belum di-set di .env (lihat OPENROUTER_MODEL)" : error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (input.trim() && !isLoading) {
                e.preventDefault();
                sendMessage(input.trim());
                setInput("");
              }
            }
          }}
          placeholder="Tanya: buatkan jadwal leg 4 hari..."
          disabled={isLoading}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14 }}
        />
        {isLoading ? (
          <button type="button" onClick={() => stop()} style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: input.trim() ? "#111" : "#9ca3af", color: "#fff", fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed" }}>
            Kirim
          </button>
        )}
        <button type="button" onClick={() => clear()} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 12 }}>
          Clear
        </button>
      </form>
      <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8, textAlign: "center" }}>
        AI bisa salah — cek kembali sebelum ikuti saran intensitas tinggi.
      </p>
    </div>
  );
}
