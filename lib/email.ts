import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const fromAddress = process.env.EMAIL_FROM || "Pathways <noreply@pathways.app>";

interface EmailUser {
  email: string;
  fullName: string;
}

export async function sendPasswordResetEmail(user: EmailUser, resetUrl: string) {
  await getResend().emails.send({
    from: fromAddress,
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F4156;">Password Reset Request</h2>
        <p>Hello ${user.fullName},</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #567C8D; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendNotificationEmail(user: EmailUser, title: string, body: string, link?: string) {
  const appUrl = process.env.AUTH_URL || "http://localhost:3000";
  const actionLink = link ? `${appUrl}${link}` : appUrl;

  await getResend().emails.send({
    from: fromAddress,
    to: user.email,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F4156;">${title}</h2>
        <p>Hello ${user.fullName},</p>
        <p>${body}</p>
        <a href="${actionLink}" style="display: inline-block; padding: 12px 24px; background-color: #567C8D; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          View in Pathways
        </a>
      </div>
    `,
  });
}
