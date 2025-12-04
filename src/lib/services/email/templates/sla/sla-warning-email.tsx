import { Button, Column, Heading, Hr, Row, Section, Text } from "@react-email/components";
import type { SLAWarningEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const SLAWarningEmail = ({
  userName,
  complaintTitle,
  remainingTime,
  dueDate,
  complaintUrl,
}: SLAWarningEmailData) => {
  return (
    <EmailLayout preview={`⚠️ تحذير SLA: ${complaintTitle}`}>
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-red-600">
        تحذير: اقتراب انتهاء SLA ⚠️
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        هذا تنبيه بأن الوقت المتبقي لمعالجة الشكوى التالية قد قارب على الانتهاء.
      </Text>

      <Section className="bg-red-50 rounded-lg p-[20px] my-[20px] border border-solid border-red-200">
        <Row>
          <Column>
            <Text className="m-0 text-[14px] text-red-800 uppercase tracking-wider mb-[4px]">
              عنوان الشكوى
            </Text>
            <Text className="m-0 text-[16px] font-bold text-red-900 mb-[16px]">
              {complaintTitle}
            </Text>
          </Column>
        </Row>

        <Hr className="border-red-200 my-[12px]" />

        <Row>
          <Column>
            <Text className="m-0 text-[14px] text-red-800 uppercase tracking-wider mb-[4px]">
              الوقت المتبقي
            </Text>
            <Text className="m-0 text-[20px] font-bold text-red-600">{remainingTime}</Text>
          </Column>
          <Column>
            <Text className="m-0 text-[14px] text-red-800 uppercase tracking-wider mb-[4px]">
              تاريخ الاستحقاق
            </Text>
            <Text className="m-0 text-[16px] font-bold text-red-900">{dueDate}</Text>
          </Column>
        </Row>
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-red-600 rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={complaintUrl}
        >
          اتخاذ إجراء فوراً
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default SLAWarningEmail;
