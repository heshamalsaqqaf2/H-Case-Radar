import { sendEmail } from "../send-email";

// ----------------------------------------------------------------------
// 1. دالة إرسال بيانات الاعتماد (تُستخدم بعد إنشاء الحساب)
// ----------------------------------------------------------------------

interface CredentialsPayload {
  to: string; // البريد الإلكتروني الشخصي للمستخدم
  subject: string;
  email: string; // بريد الدخول (البريد الإلكتروني الأساسي)
  password: string; // كلمة المرور التي أدخلها المدير (غير المشفرة)
  urlCallback: string;
}

/**
 * تُرسل بيانات الدخول (البريد وكلمة المرور) إلى البريد الإلكتروني الشخصي للمستخدم.
 * تستخدم بعد إنشاء حساب جديد من قبل المدير.
 */
export async function sendCredentialsEmail(
  payload: CredentialsPayload,
): Promise<void> {
  const { to, subject, email, password, urlCallback } = payload;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to the System!</h2>
        <p>Your account has been created by the system administrator. Here are your credentials:</p>
        <p><strong>Username (Email):</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p style="margin-top: 20px;">
          Please proceed to the login page and sign in. 
          Note that your account is currently <strong>Under Review</strong>, and you will be directed to a waiting page after login.
        </p>
        <p style="margin-top: 20px;">
          <a href="${urlCallback}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to Login Page</a>
        </p>
        <p>
          Hello ${email},\n\nThank you for, Go to Login Page and sign in.\n\nNote that your account is currently Under Review, and you will be directed to a waiting page after login.\n\nBest regards,\nYour App Team
        </p>
      </body>
    </html>
  `;

  await sendEmail({
    to: to, // الإرسال إلى البريد الشخصي
    subject: subject,
    html: htmlContent,
    text: "",
  });
}
