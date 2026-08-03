"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import type { ChatEvent, Participant } from "@/hooks/useWatchParty";

interface ChatPanelProps {
  messages: ChatEvent[];
  participants: Participant[];
  onSend: (body: string) => void;
}

export default function ChatPanel({ messages, participants, onSend }: ChatPanelProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText("");
  };

  return (
    <div className="h-full flex flex-col bg-[#111] border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Users size={14} className="text-white/50" />
        <p className="text-white/70 text-xs font-medium">
          {participants.length} {participants.length === 1 ? "pessoa" : "pessoas"} na sala
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-white/30 text-xs text-center mt-6">Nenhuma mensagem ainda — diga oi!</p>
        ) : (
          messages.map((m, i) =>
            m.system ? (
              <div key={i} className="text-center text-[11px] text-white/35 italic">
                {m.body}
              </div>
            ) : (
              <div key={i} className="text-sm">
                <span className="text-[var(--color-red)] font-semibold">{m.username}: </span>
                <span className="text-white/85">{m.body}</span>
              </div>
            )
          )
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mandar mensagem..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
        />
        <button type="submit" className="bg-[var(--color-red)] text-white p-2 rounded-lg">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
