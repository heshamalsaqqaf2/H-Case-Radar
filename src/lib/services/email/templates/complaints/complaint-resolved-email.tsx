import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import type { ComplaintResolvedEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const ComplaintResolvedEmail = ({
  userName,
  complaintTitle,
  resolvedBy,
  resolutionNotes,
  resolutionTime,
  complaintUrl,
}: ComplaintResolvedEmailData) => {
  return (
    <EmailLayout preview={`تم حل الشكوى: ${complaintTitle}`}>
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-green-600">
        تم حل الشكوى بنجاح ✅
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        يسعدنا إخبارك بأنه تم حل الشكوى الخاصة بك بواسطة <strong>{resolvedBy}</strong>.
      </Text>

      <Section className="bg-background rounded-lg p-[20px] my-[20px] border border-solid border-border">
        <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
          عنوان الشكوى
        </Text>
        <Text className="m-0 text-[16px] font-bold text-text mb-[16px]">{complaintTitle}</Text>

        <Hr className="border-border my-[12px]" />

        <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
          ملاحظات الحل
        </Text>
        <Text className="m-0 text-[16px] text-text bg-white p-3 rounded border border-border">
          {resolutionNotes}
        </Text>

        <Hr className="border-border my-[12px]" />

        <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
          وقت المعالجة
        </Text>
        <Text className="m-0 text-[16px] font-bold text-text">{resolutionTime}</Text>
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={complaintUrl}
        >
          عرض التفاصيل
        </Button>
      </Section>

      <Text className="text-muted text-[14px] leading-[24px]">
        إذا كنت تعتقد أن المشكلة لم تُحل، يمكنك إعادة فتح الشكوى من خلال الرابط أعلاه.
      </Text>
    </EmailLayout>
  );
};

export default ComplaintResolvedEmail;
