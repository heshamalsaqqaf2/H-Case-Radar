import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type * as React from "react";

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
  dir?: "rtl" | "ltr";
}

export const EmailLayout = ({ preview, children, dir = "rtl" }: EmailLayoutProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <Html dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
      <Head>
        <Font
          fontFamily="Cairo"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/cairo/v28/SLXGc1nY6HkvangtZmpcMw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#059669", // emerald-600
                secondary: "#475569", // slate-600
                background: "#f8fafc", // slate-50
                surface: "#ffffff",
                border: "#e2e8f0", // slate-200
                text: "#1e293b", // slate-800
                muted: "#64748b", // slate-500
              },
            },
          },
        }}
      >
        <Body className="bg-background my-auto mx-auto font-sans">
          <Container className="border border-solid border-border rounded my-[40px] mx-auto p-[20px] max-w-[600px] bg-surface">
            {/* Header */}
            <Section className="mt-[20px] mb-[32px] text-center">
              <Img
                src={`${baseUrl}/vercel.svg`}
                width="120"
                height="40"
                alt="H-Case-Radar"
                className="my-0 mx-auto"
              />
            </Section>

            {/* Content */}
            <Section className="px-[10px]">{children}</Section>

            {/* Footer */}
            <Section className="mt-[32px] pt-[32px] border-t border-solid border-border text-center">
              <Text className="text-[12px] text-muted leading-[20px]">
                هذه رسالة آلية من نظام H-Case-Radar لإدارة البلاغات.
                <br />
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </Text>
              <div className="text-[12px] text-muted mt-[10px]">
                <Link href={`${baseUrl}/privacy`} className="text-muted underline mx-2">
                  سياسة الخصوصية
                </Link>
                |
                <Link href={`${baseUrl}/contact`} className="text-muted underline mx-2">
                  اتصل بنا
                </Link>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
