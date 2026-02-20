import { Resend } from "resend"

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendVerificationEmail(to: string, code: string) {
  await getResend().emails.send({
    from: "GitUHb <noreply@gituhb.app>",
    to,
    subject: "Verify your UH email - GitUHb",
    html: `<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #C8102E;">GitUHb Email Verification</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C8102E;">${code}</p>
      <p style="color: #54585A; font-size: 14px;">This code expires in 15 minutes.</p>
    </div>`,
  })
}
