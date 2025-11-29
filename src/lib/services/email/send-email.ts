import nodemailer from "nodemailer";
import { z } from "zod";

const EmailDataSchema = z.object({
  to: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
});

export async function sendEmail(data: z.infer<typeof EmailDataSchema>) {
  try {
    const validated = EmailDataSchema.parse(data);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"نظام إدارة البلاغات" <${process.env.SMTP_FROM}>`,
      ...validated,
    });
    console.log("✅ Email Sent Successfully", transporter);
  } catch (error) {
    console.error("❌ Error Sending Email:", error);
  }
}
