"use client";

import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Bot,
  Loader2,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { Card, CardHeader, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Citation {
  label: string;
  href: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  refused?: boolean;
  finishReason?: string;
}

interface ApiResponse {
  choices: {
    message: { role: string; content: string };
    citations: { id: number; source: string }[];
    finish_reason: string;
  }[];
  guardrails: { refused: boolean };
}

const PHARMAGPT_API = process.env.NEXT_PUBLIC_PHARMAGPT_API ?? "http://localhost:8003";

const SUGGESTED = [
  "Metformin có dùng được khi suy thận eGFR 35 không?",
  "Liều paracetamol cho trẻ 4 tuổi nặng 18kg?",
  "Aspirin có chống chỉ định gì với người loét dạ dày?",
];

const HISTORY = [
  { id: "h1", title: "Tương tác warfarin & aspirin", at: "Hôm nay" },
  { id: "h2", title: "Liều amoxicillin cho trẻ em", at: "Hôm qua" },
  { id: "h3", title: "Quản lý đường huyết khi nhịn ăn lễ", at: "3 ngày trước" },
];

export default function PharmaGPTPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Xin chào! Tôi là PharmaGPT-VN — chatbot dược lâm sàng dành cho dược sĩ Việt Nam. Hỏi tôi về liều dùng, tương tác, chống chỉ định hoặc tư vấn cho người cao tuổi/trẻ em/phụ nữ có thai.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setSending(true);
    try {
      const reply = await callPharmaGPT(history);
      setMessages((m) => [...m, reply]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Không gọi được PharmaGPT-VN (${message}). Kiểm tra backend đang chạy ở ${PHARMAGPT_API}.`,
          refused: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[260px_1fr_300px]">
      {/* Left history */}
      <aside className="hidden flex-col gap-3 lg:flex">
        <Card>
          <CardHeader title="Cuộc hội thoại" />
          <ul className="mt-3 space-y-1">
            {HISTORY.map((h) => (
              <li
                key={h.id}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface"
              >
                <div className="font-medium">{h.title}</div>
                <div className="text-xs text-ink-muted">{h.at}</div>
              </li>
            ))}
          </ul>
        </Card>
      </aside>

      {/* Center chat */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-pill bg-violet-100 text-violet-600">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">PharmaGPT-VN</div>
              <div className="text-xs text-ink-muted">Có dẫn nguồn dược thư · Tiếng Việt</div>
            </div>
          </div>
          <div className="chip border-violet-200 bg-violet-50 text-violet-700">
            <Sparkles className="h-3 w-3" /> v4
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> PharmaGPT đang trả lời...
            </div>
          )}
        </div>

        <div className="border-t border-line bg-white p-4">
          <div className="flex flex-wrap gap-2 pb-3">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-pill border border-line bg-white px-3 py-1 text-xs text-ink-muted hover:border-brand hover:text-brand"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về thuốc, liều, tương tác... (tiếng Việt)"
              className="flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
              aria-label="Gửi"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Right sources */}
      <aside className="hidden flex-col gap-3 lg:flex">
        <Card>
          <CardHeader title="Nguồn tham khảo" />
          <ul className="mt-3 space-y-3 text-sm">
            {[
              "Dược thư Quốc gia Việt Nam 2022",
              "Hướng dẫn điều trị Bộ Y tế",
              "ADA Standards of Care 2025",
              "British National Formulary",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-violet-600" />
                <span className="text-ink-muted">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-amber-50/40">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-xs leading-relaxed text-ink-muted">
              <strong className="text-ink">Lưu ý y khoa:</strong> Câu trả lời chỉ mang tính tham
              khảo cho dược sĩ/bác sĩ. Quyết định lâm sàng vẫn phải dựa vào đánh giá trực tiếp.
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

async function callPharmaGPT(history: ChatMessage[]): Promise<ChatMessage> {
  const apiMessages = history
    .filter((m) => m.id !== "intro")
    .map((m) => ({ role: m.role, content: m.content }));
  const res = await fetch(`${PHARMAGPT_API}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "pharmagpt-vn-8b-instruct",
      messages: apiMessages,
      temperature: 0.2,
      max_tokens: 512,
      rag: { enabled: true, top_k: 5 },
    }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as ApiResponse;
  const choice = data.choices[0];
  if (!choice) {
    throw new Error("Phản hồi trống");
  }
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: choice.message.content,
    citations: choice.citations.map((c) => ({
      label: `[${c.id}] ${c.source}`,
      href: "#",
    })),
    refused: data.guardrails.refused,
    finishReason: choice.finish_reason,
  };
}

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-pill",
          isUser ? "bg-brand-100 text-brand" : "bg-violet-100 text-violet-600",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[80%]", isUser && "text-right")}>
        {message.refused && (
          <div className="mb-1 inline-flex items-center gap-1 rounded-pill bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            <AlertCircle className="h-3 w-3" />
            Từ chối an toàn{message.finishReason ? ` · ${message.finishReason}` : ""}
          </div>
        )}
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-brand text-white"
              : message.refused
                ? "bg-amber-50 text-ink"
                : "bg-surface text-ink",
          )}
        >
          {message.content}
        </div>
        {message.citations && (
          <ul className="mt-2 space-y-1 text-left">
            {message.citations.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                >
                  <BookOpen className="h-3 w-3" />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        {!isUser && (
          <div className="mt-1 flex gap-1 text-ink-subtle">
            <button className="rounded p-1 hover:bg-surface" aria-label="Hữu ích">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1 hover:bg-surface" aria-label="Không hữu ích">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
