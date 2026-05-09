"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  X,
  Users,
  User,
  GraduationCap,
  Shield,
} from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; fullName: string; avatarUrl: string | null };
  attachments: Array<{ url: string; filename: string; mimeType: string }>;
}

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

interface Contact {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface GroupedContacts {
  supervisors: Contact[];
  students: Contact[];
  admins: Contact[];
}

export default function MessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { closeSidebar } = useSidebar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<GroupedContacts>({
    supervisors: [],
    students: [],
    admins: [],
  });
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;

    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  }, [session]);

  const fetchContacts = useCallback(async (search = "") => {
    if (!session?.user) return;

    try {
      const res = await fetch(`/api/contacts?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  }, [session]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!session?.user) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);

        // Mark as read
        await fetch(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAsRead: true }),
        });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    fetchConversations();
    fetchContacts();
    setLoading(false);
  }, [status, router, fetchConversations, fetchContacts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    const other = conv.participants[0];
    if (!other) return false;
    return other.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv.id);
    setShowMobileChat(true);
    fetchMessages(conv.id);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: [userId] }),
      });

      if (res.ok) {
        const newConv = await res.json();
        await fetchConversations();
        const fullConv = conversations.find((c) => c.id === newConv.id);
        if (fullConv) {
          handleSelectConversation(fullConv);
        }
      }
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, {
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
      fetchConversations(); // Update conversation list
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.id !== session?.user?.id) || conv.participants[0];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-green-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const currentConversation = conversations.find((c) => c.id === selectedConversation);
  const currentParticipant = currentConversation ? getOtherParticipant(currentConversation) : null;

  if (status === "loading" || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Left Sidebar - Contact List */}
      <div
        className={`
          ${showMobileChat ? "hidden md:flex" : "flex"}
          w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-gray-50
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <button
              onClick={() => closeSidebar()}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Conversations & Contacts */}
        <div className="flex-1 overflow-y-auto scroll-container">
          {/* Active Conversations */}
          {filteredConversations.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                Recent
              </h3>
              <div className="space-y-1">
                {filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  if (!other) return null;
                  const isActive = selectedConversation === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl transition-all
                        ${isActive ? "bg-brand-teal text-white shadow-md" : "hover:bg-gray-100"}
                      `}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                            ${isActive ? "bg-white/20" : getAvatarColor(other.fullName)}
                          `}
                        >
                          {other.avatarUrl ? (
                            <img
                              src={other.avatarUrl}
                              alt={other.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(other.fullName)
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                            {other.fullName}
                          </span>
                          {conv.latestMessage && (
                            <span className={`text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>
                              {formatDistanceToNow(new Date(conv.latestMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm truncate ${isActive ? "text-white/80" : "text-gray-500"}`}
                        >
                          {conv.latestMessage
                            ? conv.latestMessage.sender.id === session?.user?.id
                              ? `You: ${conv.latestMessage.body}`
                              : conv.latestMessage.body
                            : "No messages yet"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && !isActive && (
                        <span className="bg-brand-teal text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Contacts */}
          <div className="p-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Start New Chat
            </h3>
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  fetchContacts(e.target.value);
                }}
                placeholder="Search people..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
              />
            </div>

            {/* Supervisors */}
            {contacts.supervisors.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 px-2 mb-2 text-gray-500">
                  <GraduationCap size={14} />
                  <span className="text-xs font-medium">Supervisors</span>
                </div>
                <div className="space-y-1">
                  {contacts.supervisors.map((contact) => {
                    const hasConversation = conversations.some((c) =>
                      c.participants.some((p) => p.id === contact.id)
                    );
                    return (
                      <button
                        key={contact.id}
                        onClick={() => !hasConversation && handleStartConversation(contact.id)}
                        disabled={hasConversation}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
                          ${hasConversation ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
                        `}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(
                            contact.fullName
                          )}`}
                        >
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(contact.fullName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="font-medium text-gray-800 text-sm truncate block">
                            {contact.fullName}
                          </span>
                          <span className="text-xs text-gray-400 truncate block">
                            {contact.role.replace("_", " ")}
                          </span>
                        </div>
                        {hasConversation && (
                          <span className="text-xs text-gray-400">Already chatting</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Students */}
            {contacts.students.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 px-2 mb-2 text-gray-500">
                  <User size={14} />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <div className="space-y-1">
                  {contacts.students.map((contact) => {
                    const hasConversation = conversations.some((c) =>
                      c.participants.some((p) => p.id === contact.id)
                    );
                    return (
                      <button
                        key={contact.id}
                        onClick={() => !hasConversation && handleStartConversation(contact.id)}
                        disabled={hasConversation}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
                          ${hasConversation ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
                        `}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(
                            contact.fullName
                          )}`}
                        >
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(contact.fullName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="font-medium text-gray-800 text-sm truncate block">
                            {contact.fullName}
                          </span>
                          <span className="text-xs text-gray-400 truncate block">Student</span>
                        </div>
                        {hasConversation && (
                          <span className="text-xs text-gray-400">Already chatting</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admins */}
            {contacts.admins.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 px-2 mb-2 text-gray-500">
                  <Shield size={14} />
                  <span className="text-xs font-medium">Admins</span>
                </div>
                <div className="space-y-1">
                  {contacts.admins.map((contact) => {
                    const hasConversation = conversations.some((c) =>
                      c.participants.some((p) => p.id === contact.id)
                    );
                    return (
                      <button
                        key={contact.id}
                        onClick={() => !hasConversation && handleStartConversation(contact.id)}
                        disabled={hasConversation}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
                          ${hasConversation ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
                        `}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(
                            contact.fullName
                          )}`}
                        >
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(contact.fullName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="font-medium text-gray-800 text-sm truncate block">
                            {contact.fullName}
                          </span>
                          <span className="text-xs text-gray-400 truncate block">Admin</span>
                        </div>
                        {hasConversation && (
                          <span className="text-xs text-gray-400">Already chatting</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {contacts.supervisors.length === 0 &&
              contacts.students.length === 0 &&
              contacts.admins.length === 0 &&
              contactSearch && (
                <div className="text-center py-8 text-gray-400">
                  <p>No contacts found</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div
        className={`
          ${showMobileChat ? "flex" : "hidden md:flex"}
          ${selectedConversation ? "flex-1" : "hidden md:flex md:flex-1"}
          flex-col bg-white
        `}
      >
        {!selectedConversation ? (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h2>
            <p className="text-sm">Choose a conversation from the left or start a new one</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                {showMobileChat && (
                  <button
                    onClick={handleBackToList}
                    className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="relative">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                      currentParticipant?.fullName || ""
                    )}`}
                  >
                    {currentParticipant?.avatarUrl ? (
                      <img
                        src={currentParticipant.avatarUrl}
                        alt={currentParticipant.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(currentParticipant?.fullName || "")
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{currentParticipant?.fullName}</h2>
                  <p className="text-xs text-gray-400">
                    {currentParticipant?.role.replace("_", " ")} • Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <Video size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-container"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <p className="mb-2">No messages yet</p>
                    <p className="text-sm">Say hello to start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender.id === session?.user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                        {!isOwn && (
                          <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender.fullName}</span>
                        )}
                        <div
                          className={`
                            px-4 py-2.5 shadow-sm
                            ${isOwn
                              ? "bg-brand-teal text-white rounded-2xl rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md"
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.body}
                          </p>
                          {msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att) => (
                                <a
                                  key={att.url}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs underline opacity-80 hover:opacity-100"
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

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-3 text-sm">{error}</div>
              )}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Attach file (coming soon)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <div className="flex-1 bg-gray-100 rounded-2xl">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm px-4 py-3 resize-none max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-brand-teal text-white rounded-full hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
