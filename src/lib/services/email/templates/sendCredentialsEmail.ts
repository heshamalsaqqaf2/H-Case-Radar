import { sendEmail } from "@/lib/services/email/send-email";

interface CredentialsPayload {
  to: string;
  subject: string;
  email: string;
  password: string;
  urlCallback: string;
}

/**
 * تُرسل بيانات الدخول (البريد وكلمة المرور) إلى البريد الإلكتروني الشخصي للمستخدم.
 * تستخدم بعد إنشاء حساب جديد من قبل المدير.
 */
export async function sendCredentialsEmail(payload: CredentialsPayload): Promise<void> {
  const { to, subject, email, password, urlCallback } = payload;

  const htmlContent = `
    <html>
      <body style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; text-align: right;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #007bff;">مرحبًا بك في نظام إدارة البلاغات!</h2>
          <p>تم إنشاء حسابك من قبل المدير. إليك بيانات الدخول:</p>
          <ul>
            <li><strong>البريد الإلكتروني:</strong> ${email}</li>
            <li><strong>كلمة المرور المؤقتة:</strong> ${password}</li>
          </ul>
          <p style="margin: 20px 0;">
            يُرجى تسجيل الدخول إلى النظام وتعيين كلمة مرور جديدة لاحقًا.
          </p>
          <p style="margin: 20px 0;">
            <a href="${urlCallback}" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              الانتقال إلى صفحة تسجيل الدخول
            </a>
          </p>
          <p style="font-size: 14px; color: #777;">
            ملاحظة: حسابك قيد المراجعة، وقد يتم توجيهك إلى صفحة انتظار بعد تسجيل الدخول.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    مرحباً بك في نظام إدارة البلاغات!
    تم إنشاء حسابك من قبل المدير. إليك بيانات الدخول:
    - البريد الإلكتروني: ${email}
    - كلمة المرور المؤقتة: ${password}
    
    يُرجى تسجيل الدخول إلى النظام عبر الرابط:
    ${urlCallback}
    ملاحظة: حسابك قيد المراجعة، وقد يتم توجيهك إلى صفحة انتظار بعد تسجيل الدخول.
    مع تحيات فريق النظام.
  `;

  await sendEmail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
  });
}
