import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1),
});

export async function GET(req: Request) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);

    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const conversationsWithUnread = conversations.map((conv) => {
      const currentUserParticipant = conv.participants.find((p) => p.userId === session.user.id);
      const unreadCount = currentUserParticipant?.lastReadAt
        ? conv.messages.filter((m) => m.createdAt > currentUserParticipant.lastReadAt!).length
        : conv.messages.length;

      const otherParticipants = conv.participants.filter((p) => p.userId !== session.user.id);

      return {
        id: conv.id,
        lastMessageAt: conv.lastMessageAt,
        participants: otherParticipants.map((p) => p.user),
        latestMessage: conv.messages[0] || null,
        unreadCount,
      };
    });

    return NextResponse.json(conversationsWithUnread);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch conversations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const body = await req.json();
    const data = createConversationSchema.parse(body);

    const allParticipantIds = [session.user.id, ...data.participantIds];

    const existing = await db.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: allParticipantIds },
          },
        },
      },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (
      existing &&
      existing.participants.length === allParticipantIds.length &&
      allParticipantIds.every((id) => existing.participants.some((p) => p.userId === id))
    ) {
      return NextResponse.json(existing);
    }

    const conversation = await db.conversation.create({
      data: {
        participants: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
      },
    });

    await db.notification.create({
      data: {
        userId: data.participantIds[0],
        type: "MESSAGE",
        title: "New Conversation",
        body: `${session.user.fullName} started a conversation with you.`,
        link: `/messages/${conversation.id}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_CONVERSATION",
        entity: "Conversation",
        entityId: conversation.id,
        metadata: { participantIds: allParticipantIds },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to create conversation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
