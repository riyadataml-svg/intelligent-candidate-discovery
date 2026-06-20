"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Brain,
  Loader2,
  Copy,
  RefreshCw,
  CheckCircle,
  Sparkles,
  User,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
}

const STARTER_QUESTIONS = [
  "Which career suits me best?",
  "How do I become a Data Scientist?",
  "What skills do I need for Backend Development?",
  "How can I improve my resume?",
  "How do I prepare for technical interviews?",
  "What's the best way to switch careers into tech?",
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer for bold and bullets
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("• ") || line.startsWith("- ")) {
          const content = line.replace(/^[•\-]\s+/, "");
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>") }} />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>") }} />
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cc_profile");
    if (stored) setProfile(JSON.parse(stored));

    // Welcome message
    setMessages([
      {
        id: "welcome",
        role: "ai",
        content: `Hi there! 👋 I'm CareerCopilot AI, your personal career mentor. I'm here to help you with career guidance, skill development, interview prep, and much more.\n\nWhat would you like to explore today?`,
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
          userProfile: profile,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: "I encountered an error. Please try again!" },
      ]);
    }
    setLoading(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setMessages((prev) => prev.slice(0, -1));
      await sendMessage(lastUser.content);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              Career Chat AI
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              CareerCopilot is online
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="btn-ghost text-xs"
        >
          <RefreshCw size={13} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === "ai" ? "gradient-brand" : "bg-white/10 border border-white/10"
              }`}
            >
              {msg.role === "ai" ? (
                <Brain size={15} className="text-white" />
              ) : (
                <User size={15} className="text-slate-300" />
              )}
            </div>

            {/* Bubble */}
            <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
              <div className={`text-sm leading-relaxed ${msg.role === "user" ? "text-white" : "text-slate-300"}`}>
                {msg.role === "ai" ? (
                  <MarkdownText text={msg.content} />
                ) : (
                  msg.content
                )}
              </div>

              {msg.role === "ai" && msg.id !== "welcome" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === msg.id ? <CheckCircle size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
              <Brain size={15} className="text-white" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (show when only welcome message) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles size={11} className="text-indigo-400" />
            Suggested questions
          </div>
          <div className="flex flex-wrap gap-2">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate */}
      {messages.length > 1 && !loading && (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
          <button onClick={regenerate} className="btn-ghost text-xs mx-auto flex">
            <RefreshCw size={12} />
            Regenerate response
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 border-t border-white/[0.06] max-w-3xl mx-auto w-full">
        <div className="flex gap-3 items-end">
          <textarea
            className="input-dark flex-1 resize-none min-h-[48px] max-h-[120px]"
            placeholder="Ask me anything about your career..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input.trim());
              }
            }}
          />
          <button
            onClick={() => sendMessage(input.trim())}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-3 h-[48px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="text-xs text-slate-600 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
