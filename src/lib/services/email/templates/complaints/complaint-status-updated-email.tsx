import { Button, Column, Heading, Hr, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import type { ComplaintStatusUpdatedEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const ComplaintStatusUpdatedEmail = ({
  userName,
  complaintTitle,
  oldStatus,
  newStatus,
  updatedBy,
  complaintUrl,
}: ComplaintStatusUpdatedEmailData) => {
  return (
    <EmailLayout preview={`تحديث حالة الشكوى: ${complaintTitle}`}>
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-text">
        تحديث حالة الشكوى 🔄
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        تم تحديث حالة الشكوى الخاصة بك بواسطة <strong>{updatedBy}</strong>.
      </Text>

      <Section className="bg-background rounded-lg p-[20px] my-[20px] border border-solid border-border">
        <Text className="m-0 text-[16px] font-bold text-text mb-[16px] text-center">
          {complaintTitle}
        </Text>

        <Hr className="border-border my-[12px]" />

        <Row className="text-center">
          <Column>
            <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
              الحالة السابقة
            </Text>
            <Text className="m-0 text-[16px] font-bold text-muted line-through">{oldStatus}</Text>
          </Column>
          <Column>
            <Text className="m-0 text-[24px] text-muted">➜</Text>
          </Column>
          <Column>
            <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
              الحالة الجديدة
            </Text>
            <Text className="m-0 text-[16px] font-bold text-primary">{newStatus}</Text>
          </Column>
        </Row>
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={complaintUrl}
        >
          متابعة الشكوى
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ComplaintStatusUpdatedEmail;
