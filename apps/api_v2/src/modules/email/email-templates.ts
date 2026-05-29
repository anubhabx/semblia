import { EmailTemplateKey } from "@workspace/database/prisma";
import {
  emailTextFooter,
  paragraph,
  renderEmailLayout,
} from "./email-layout.js";
import type {
  EmailTemplatePayload,
  NotificationEmailPayload,
  ProjectMemberInviteEmailPayload,
  RenderedEmail,
} from "./email.types.js";

export function renderEmailTemplate(
  input: EmailTemplatePayload,
): RenderedEmail {
  switch (input.template) {
    case EmailTemplateKey.NOTIFICATION:
      return renderNotificationEmail(input.payload);
    case EmailTemplateKey.PROJECT_MEMBER_INVITE:
      return renderProjectInviteEmail(input.payload);
  }
}

function renderNotificationEmail(
  payload: NotificationEmailPayload,
): RenderedEmail {
  const subject = trimSubject(payload.title);
  const cta = payload.link
    ? { label: "Open in Tresta", href: payload.link }
    : null;

  const html = renderEmailLayout({
    preheader: payload.message,
    heading: payload.title,
    bodyHtml: paragraph(payload.message),
    cta,
  });

  const text = [
    payload.title,
    payload.message,
    cta ? `Open in Tresta: ${cta.href}` : "",
    emailTextFooter(),
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, text, html };
}

function renderProjectInviteEmail(
  payload: ProjectMemberInviteEmailPayload,
): RenderedEmail {
  const inviter = payload.inviterEmail
    ? `${payload.inviterEmail} invited you`
    : "You've been invited";
  const subject = trimSubject(`Invitation to ${payload.projectName}`);
  const lead = `${inviter} to join ${payload.projectName} as ${formatRole(payload.role)} on Tresta.`;

  const html = renderEmailLayout({
    preheader: lead,
    heading: `Join ${payload.projectName}`,
    bodyHtml: paragraph(lead),
    cta: { label: "Accept invitation", href: payload.acceptUrl },
    footnote:
      "If you weren't expecting this invitation, you can safely ignore this email.",
  });

  const text = [
    lead,
    `Accept invitation: ${payload.acceptUrl}`,
    "If you weren't expecting this invitation, you can safely ignore this email.",
    emailTextFooter(),
  ].join("\n\n");

  return { subject, text, html };
}

function formatRole(role: string) {
  const normalized = role.trim().toLowerCase();
  if (!normalized) {
    return "a member";
  }
  const article = /^[aeiou]/.test(normalized) ? "an" : "a";
  return `${article} ${normalized}`;
}

function trimSubject(value: string) {
  return value.trim().slice(0, 255);
}
