import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  body: z.string().min(1).max(10000),
  attachments: z.array(z.object({
    url: z.string().url(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number().int()
  })).optional()
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const messages = await db.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? {
        cursor: { id: cursor },
        skip: 1,
      } : {}),
    });

    let nextCursor: string | null = null;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = messageSchema.parse(body);

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: data.body,
        attachments: {
          create: data.attachments || []
        }
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        attachments: true,
      },
    });

    await db.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    const otherParticipants = conversation.participants.filter((p) => p.userId !== session.user.id);

    await Promise.all(
      otherParticipants.map((p) =>
        db.notification.create({
          data: {
            userId: p.userId,
            type: "MESSAGE",
            title: `New message from ${session.user.fullName}`,
            body: data.body.slice(0, 100) + (data.body.length > 100 ? "..." : ""),
            link: `/messages/${id}`,
          },
        })
      )
    );

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SEND_MESSAGE",
        entity: "Message",
        entityId: message.id,
        metadata: { conversationId: id },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
