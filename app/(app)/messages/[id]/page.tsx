"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; fullName: string; avatarUrl: string | null };
  attachments: Array<{ url: string; filename: string; mimeType: string }>;
}

interface Participant {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

export default function MessageThreadPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.id as string;

  const fetchMessages = useCallback(async () => {
    if (!session?.user || !conversationId) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);

        await fetch(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAsRead: true }),
        });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  }, [session, conversationId]);

  const fetchParticipants = useCallback(async () => {
    if (!session?.user || !conversationId) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(
          data.participants
            .filter((p: { user: { id: string } }) => p.user.id !== session.user.id)
            .map((p: { user: Participant }) => p.user)
        );
      }
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  }, [session, conversationId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    fetchMessages();
    fetchParticipants();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [status, router, fetchMessages, fetchParticipants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherParticipants = participants;
  const title =
    otherParticipants.length === 1
      ? otherParticipants[0]?.fullName || "Unknown"
      : `${otherParticipants.length} participants`;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <Link href="/messages" className="hover:bg-gray-200 p-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-brand-navy" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-beige flex items-center justify-center text-brand-navy font-medium text-sm">
            {title.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-semibold text-brand-navy">{title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender.id === session?.user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  {!isOwn && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.fullName}</span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-brand-teal text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    {msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.url}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm underline"
                          >
                            📎 {att.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 mx-1">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-2 text-sm">{error}</div>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-brand-navy transition-colors"
            title="Attach file (coming soon)"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-brand-teal text-white rounded-full hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
