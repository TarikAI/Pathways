"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  lastMessageAt: string;
  participants: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  }>;
  latestMessage: {
    id: string;
    body: string;
    createdAt: string;
    sender: { id: string; fullName: string };
  } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h1 className="font-semibold text-lg text-brand-navy">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No messages yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Messages will appear here when you start an internship.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants[0];
              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors relative"
                >
                  {conv.unreadCount > 0 && (
                    <span className="absolute top-4 right-4 bg-brand-teal text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-beige flex items-center justify-center text-brand-navy font-medium">
                      {other.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-brand-navy truncate">{other.fullName}</span>
                        {conv.latestMessage && (
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(conv.latestMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.latestMessage
                          ? conv.latestMessage.sender.id === session?.user.id
                            ? `You: ${conv.latestMessage.body}`
                            : conv.latestMessage.body
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-gray-50">
        <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  );
}
