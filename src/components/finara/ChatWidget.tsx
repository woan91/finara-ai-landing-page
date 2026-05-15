import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SYSTEM_PROMPT =
  "You are Finara AI, a warm and friendly financial companion for young professionals in Singapore and Southeast Asia. You ONLY answer questions about savings, budgeting, financial goals, CPF, emergency funds, and personal finance planning. If asked anything outside finance, politely redirect. Always be encouraging, never judgmental. Keep answers concise and practical. Add relevant emojis occasionally.";

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  text: "Hi! I'm Finara AI 👋 Ask me anything about savings, budgeting, or financial goals!",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined;
      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: "I'm not configured yet — please add your VITE_CLAUDE_API_KEY to get started!",
          },
        ]);
        return;
      }

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "init")
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-allow-browser": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = (await res.json()) as { content: { type: string; text: string }[] };
      const reply = data.content.find((c) => c.type === "text")?.text ?? "Sorry, I couldn't respond right now.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Oops, something went wrong. Please try again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open Finara AI chat"}
        className="fixed bottom-6 right-6 z-[70] flex size-14 items-center justify-center rounded-full shadow-glow transition hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, oklch(0.55 0.22 310) 0%, oklch(0.6 0.24 280) 50%, oklch(0.55 0.2 265) 100%)",
        }}
      >
        {open ? (
          <X className="size-6 text-white" />
        ) : (
          <MessageCircle className="size-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[70] flex w-[350px] max-w-[calc(100vw-1.5rem)] flex-col rounded-3xl border border-border bg-card shadow-card overflow-hidden"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border"
            style={{
              background: "linear-gradient(135deg, oklch(0.55 0.22 310) 0%, oklch(0.55 0.2 265) 100%)",
            }}
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Finara AI</div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-white/80">Online</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "text-white"
                      : "bg-secondary text-foreground/90"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.55 0.22 310) 0%, oklch(0.55 0.2 265) 100%)",
                        }
                      : undefined
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about savings, budgeting..."
              disabled={loading}
              className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition disabled:opacity-60 placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 310) 0%, oklch(0.55 0.2 265) 100%)",
              }}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
