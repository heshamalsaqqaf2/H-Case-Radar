export class EmailService {
  async sendWelcomeEmail(data: WelcomeEmailData) {
    try {
      console.log("📧 محاولة إرسال بريد ترحيب إلى:", data.personalEmail);

      // محاكاة الإرسال الناجح
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("✅ تم إرسال البريد بنجاح (محاكاة)");
      return {
        success: true,
        messageId: `simulated-  ${Date.now()}`,
        to: data.personalEmail,
      };
    } catch (error) {
      console.error("❌ خطأ في إرسال البريد:", error);
      return {
        success: false,
        error: "فشل في إرسال البريد",
        to: data.personalEmail,
      };
    }
  }
}
