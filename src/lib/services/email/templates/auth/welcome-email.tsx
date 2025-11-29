import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import type { WelcomeEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const WelcomeEmail = ({ userName, dashboardUrl }: WelcomeEmailData) => {
  return (
    <EmailLayout preview="مرحباً بك في H-Case-Radar">
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-text">
        أهلاً بك في العائلة! 🚀
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        نحن سعداء جداً بانضمامك إلينا في نظام H-Case-Radar لإدارة الشكاوى.
      </Text>

      <Text className="text-text text-[16px] leading-[24px]">
        يمكنك الآن البدء في استخدام النظام، متابعة الشكاوى، والاطلاع على التقارير بكل سهولة.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={dashboardUrl}
        >
          الذهاب إلى لوحة التحكم
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default WelcomeEmail;
