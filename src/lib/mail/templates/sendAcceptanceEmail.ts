import { sendEmail } from "../send-email";

// ----------------------------------------------------------------------
// 2. دالة إرسال إشعار القبول (تُستخدم بعد قبول الحساب)
// ----------------------------------------------------------------------

interface AcceptancePayload {
  to: string; // البريد الإلكتروني الشخصي للمستخدم
  subject: string;
  user: { name: string; email: string }; // بيانات المستخدم الجديد
  urlCallback: string;
}

/**
 * تُرسل إشعار القبول إلى البريد الإلكتروني الشخصي بعد تغيير حالة المستخدم إلى 'accepted'.
 * تُستخدم في خطاف databaseHooks.user.update.after.
 */
export async function sendAcceptanceEmail(
  payload: AcceptancePayload,
): Promise<void> {
  const { to, subject, user, urlCallback } = payload;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background-color: #f5f5f5; padding: 20px;">
          <img src="https://example.com/logo.png" alt="Logo" style="max-width: 200px; display: block; margin: 0 auto;">
        </div>

        <h2>Account Approved and Activated! 🎉</h2>
        <p>Dear ${user.name},</p>
        <p>We are pleased to inform you that your account (${user.email}) has been successfully reviewed and activated by the system administrator.</p>
        <p>You can now log in and access all features of the application.</p>
        <p style="margin-top: 20px;">
          <a href="${urlCallback}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to Login Page</a>
        </p>
        <p>Thank you for your patience.</p>
      </body>
    </html>
  `;

  await sendEmail({
    to: to, // الإرسال إلى البريد الشخصي
    subject: subject,
    text: " ds",
    html: htmlContent,
  });
}
