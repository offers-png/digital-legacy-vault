import { ENV } from "./_core/env";

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = ENV.resendApiKey;
  const from = ENV.fromEmail || "Digital Legacy Vault <noreply@digitallegacyvault.com>";

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email to:", to);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Email] Resend API error ${res.status}: ${text}`);
  }
}

export async function sendCheckInReminder(
  to: string,
  name: string,
  daysOverdue: number
): Promise<void> {
  const subject = `[Action Required] Check-in reminder — ${daysOverdue} days remaining`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Digital Legacy Vault — Check-In Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder that your Dead Man's Switch check-in is due in <strong>${daysOverdue} days</strong>.</p>
      <p>If you do not check in within this time, your designated executors will be notified.</p>
      <p>
        <a href="${ENV.oAuthServerUrl}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
          Check In Now
        </a>
      </p>
      <p style="color:#6b7280;font-size:0.85em;">
        You are receiving this because you have a Dead Man's Switch configured on Digital Legacy Vault.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendExecutorInvitation(
  to: string,
  ownerName: string,
  invitationToken: string
): Promise<void> {
  const subject = `${ownerName} has designated you as an executor on Digital Legacy Vault`;
  const acceptUrl = `${ENV.oAuthServerUrl}/accept-executor?token=${invitationToken}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">You've Been Designated as an Executor</h2>
      <p><strong>${ownerName}</strong> has added you as a trusted executor on Digital Legacy Vault.</p>
      <p>As an executor, you will be notified if ${ownerName} fails to check in over an extended period, and will be able to access their designated digital assets after providing a death certificate.</p>
      <p>
        <a href="${acceptUrl}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
          Accept Designation
        </a>
      </p>
      <p style="color:#6b7280;font-size:0.85em;">
        If you do not recognise this request, you can safely ignore this email.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendDeathAlert(
  to: string,
  executorName: string,
  ownerName: string
): Promise<void> {
  const subject = `Important: ${ownerName} has missed their check-in — action may be required`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Dead Man's Switch Triggered</h2>
      <p>Hi ${executorName},</p>
      <p><strong>${ownerName}</strong> has not checked in for an extended period. As a designated executor, you are being notified per their instructions.</p>
      <p>To access their digital assets, please log in to Digital Legacy Vault and submit a verified death certificate.</p>
      <p>
        <a href="${ENV.oAuthServerUrl}" style="background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
          Log In to Digital Legacy Vault
        </a>
      </p>
      <p style="color:#6b7280;font-size:0.85em;">
        If ${ownerName} is alive and checks in, this notification will be cancelled automatically.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendAccountDeletionConfirmation(
  to: string,
  name: string
): Promise<void> {
  const subject = "Your Digital Legacy Vault account has been deleted";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Account Deletion Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Your Digital Legacy Vault account and all associated data have been permanently deleted.</p>
      <p>This includes all digital assets, executor designations, check-in history, and personal information.</p>
      <p>If you did not request this deletion, please contact us immediately at
        <a href="mailto:support@digitallegacyvault.com">support@digitallegacyvault.com</a>.
      </p>
      <p style="color:#6b7280;font-size:0.85em;">
        Thank you for using Digital Legacy Vault.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
}
