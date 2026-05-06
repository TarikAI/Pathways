import { requireSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";

export default async function MessagesPage() {
  const session = await requireSession();
  
  const conversations = await db.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id } }
    },
    include: {
      participants: { include: { user: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 font-semibold text-lg bg-gray-50">
          Conversations
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No messages yet.</div>
          ) : (
            conversations.map(c => {
              const other = c.participants.find(p => p.userId !== session.user.id)?.user;
              const lastMsg = c.messages[0];
              return (
                <div key={c.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium">{other?.fullName || "Unknown"}</div>
                  <div className="text-sm text-gray-500 truncate">{lastMsg?.body || "No messages"}</div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  );
}
