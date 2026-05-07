import { db } from "./db";
import { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "./email";

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(input: NotificationInput) {
  const notification = await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });

  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { email: true, fullName: true, notifyByEmail: true },
  });

  if (user?.notifyByEmail) {
    try {
      await sendNotificationEmail(user, input.title, input.body, input.link);
    } catch {
      // Email delivery failure should not block the notification creation
    }
  }

  return notification;
}
