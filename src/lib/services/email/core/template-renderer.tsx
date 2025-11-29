import { render } from "@react-email/components";
import type * as React from "react";
import {
  ComplaintAssignedEmail,
  ComplaintResolvedEmail,
  ComplaintStatusUpdatedEmail,
  CredentialsEmail,
  PasswordResetEmail,
  SLAWarningEmail,
  WelcomeEmail,
} from "../templates";
import { EMAIL_TEMPLATES, type EmailTemplate } from "../types/email-types";

/**
 * Render Email Template
 * تحويل القالب إلى HTML ونص عادي
 */
export async function renderEmailTemplate(
  template: EmailTemplate,
  data: any,
): Promise<{ html: string; text: string }> {
  let component: React.ReactElement;

  switch (template) {
    // Auth
    case EMAIL_TEMPLATES.CREDENTIALS:
      component = <CredentialsEmail {...data} />;
      break;
    case EMAIL_TEMPLATES.WELCOME:
      component = <WelcomeEmail {...data} />;
      break;
    case EMAIL_TEMPLATES.PASSWORD_RESET:
      component = <PasswordResetEmail {...data} />;
      break;

    // Complaints
    case EMAIL_TEMPLATES.COMPLAINT_ASSIGNED:
      component = <ComplaintAssignedEmail {...data} />;
      break;
    case EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED:
      component = <ComplaintStatusUpdatedEmail {...data} />;
      break;
    case EMAIL_TEMPLATES.COMPLAINT_RESOLVED:
      component = <ComplaintResolvedEmail {...data} />;
      break;

    // SLA
    case EMAIL_TEMPLATES.SLA_WARNING:
      component = <SLAWarningEmail {...data} />;
      break;

    default:
      // Fallback for unimplemented templates
      component = (
        <div>
          <h1>Template: {template}</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }

  const html = await render(component);
  const text = await render(component, { plainText: true });

  return { html, text };
}
