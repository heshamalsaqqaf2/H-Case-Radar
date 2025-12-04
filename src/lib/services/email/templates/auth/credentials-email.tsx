import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import type { CredentialsEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const CredentialsEmail = ({ userName, email, password, loginUrl }: CredentialsEmailData) => {
  return (
    <EmailLayout preview="بيانات الدخول الخاصة بك">
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-text">
        مرحباً بك في H-Case-Radar 👋
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        تم إنشاء حساب جديد لك في نظام إدارة الشكاوى. يرجى استخدام البيانات التالية لتسجيل الدخول:
      </Text>

      <Section className="bg-background rounded-lg p-[20px] my-[20px] border border-solid border-border text-center">
        <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[8px]">
          البريد الإلكتروني
        </Text>
        <Text className="m-0 text-[18px] font-mono font-bold text-text mb-[16px]">{email}</Text>

        <Hr className="border-border my-[12px]" />

        <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[8px]">
          كلمة المرور المؤقتة
        </Text>
        <Text className="m-0 text-[24px] font-mono font-bold text-primary tracking-widest bg-white inline-block px-4 py-2 rounded border border-dashed border-primary/30">
          {password}
        </Text>
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={loginUrl}
        >
          تسجيل الدخول للنظام
        </Button>
      </Section>

      <Text className="text-muted text-[14px] leading-[24px]">
        يرجى تغيير كلمة المرور فور تسجيل الدخول لأول مرة لضمان أمان حسابك.
      </Text>
    </EmailLayout>
  );
};

export default CredentialsEmail;
