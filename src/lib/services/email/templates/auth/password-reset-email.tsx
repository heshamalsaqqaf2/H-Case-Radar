import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import type { PasswordResetEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const PasswordResetEmail = ({ userName, resetUrl, expiresIn }: PasswordResetEmailData) => {
  return (
    <EmailLayout preview="إعادة تعيين كلمة المرور">
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-text">
        إعادة تعيين كلمة المرور 🔒
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. إذا لم تقم بهذا الطلب، يمكنك تجاهل
        هذه الرسالة بأمان.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={resetUrl}
        >
          إعادة تعيين كلمة المرور
        </Button>
      </Section>

      <Text className="text-muted text-[14px] leading-[24px] text-center">
        هذا الرابط صالح لمدة {expiresIn}.
      </Text>
    </EmailLayout>
  );
};

export default PasswordResetEmail;
