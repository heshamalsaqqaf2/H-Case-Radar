import { Button, Column, Heading, Hr, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import type { ComplaintAssignedEmailData } from "../../types/email-types";
import EmailLayout from "../base/email-layout";

export const ComplaintAssignedEmail = ({
  userName,
  complaintTitle,
  category,
  priority,
  assignedBy,
  dueDate,
  complaintUrl,
}: ComplaintAssignedEmailData) => {
  const priorityColor =
    priority === "critical"
      ? "#ef4444" // red-500
      : priority === "high"
        ? "#f97316" // orange-500
        : priority === "medium"
          ? "#eab308" // yellow-500
          : "#22c55e"; // green-500

  return (
    <EmailLayout preview={`شكوى جديدة تم تعيينها لك: ${complaintTitle}`}>
      <Heading className="text-[24px] font-bold text-center p-0 my-[30px] mx-0 text-text">
        شكوى جديدة 📋
      </Heading>

      <Text className="text-text text-[16px] leading-[24px]">مرحباً {userName}،</Text>

      <Text className="text-text text-[16px] leading-[24px]">
        تم تعيين شكوى جديدة لك من قبل <strong>{assignedBy}</strong>.
      </Text>

      <Section className="bg-background rounded-lg p-[20px] my-[20px] border border-solid border-border">
        <Row>
          <Column>
            <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
              عنوان الشكوى
            </Text>
            <Text className="m-0 text-[16px] font-bold text-text mb-[16px]">{complaintTitle}</Text>
          </Column>
        </Row>

        <Hr className="border-border my-[12px]" />

        <Row>
          <Column>
            <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
              التصنيف
            </Text>
            <Text className="m-0 text-[16px] font-bold text-text">{category}</Text>
          </Column>
          <Column>
            <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
              الأولوية
            </Text>
            <Text className="m-0 text-[16px] font-bold" style={{ color: priorityColor }}>
              {priority}
            </Text>
          </Column>
        </Row>

        {dueDate && (
          <>
            <Hr className="border-border my-[12px]" />
            <Row>
              <Column>
                <Text className="m-0 text-[14px] text-muted uppercase tracking-wider mb-[4px]">
                  تاريخ الاستحقاق
                </Text>
                <Text className="m-0 text-[16px] font-bold text-text">{dueDate}</Text>
              </Column>
            </Row>
          </>
        )}
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-primary rounded text-white text-[16px] font-bold no-underline text-center px-[24px] py-[12px]"
          href={complaintUrl}
        >
          عرض الشكوى
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ComplaintAssignedEmail;
