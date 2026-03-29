interface CouponEmailData {
  to: string
  playerName: string
  merchantName: string
  prizeName: string
  prizeEmoji?: string
  couponCode: string
  validFrom: string
  validUntil: string
}

export async function sendCouponEmail(data: CouponEmailData, resendApiKey: string): Promise<void> {
  if (!resendApiKey) {
    console.log('[Email] RESEND_API_KEY not set, skipping email for', data.to)
    return
  }

  const html = buildCouponEmailHtml(data)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Win & Win <onboarding@resend.dev>',
      to: data.to,
      subject: `You won at ${data.merchantName}!`,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend API error ${res.status}: ${text}`)
  }
}

function buildCouponEmailHtml(data: CouponEmailData): string {
  const emoji = data.prizeEmoji || '🎁'
  const validFrom = new Date(data.validFrom).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const validUntil = new Date(data.validUntil).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#ec4899 100%);padding:32px 24px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Win & Win</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">${data.merchantName}</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 24px;">
            <div style="text-align:center;font-size:48px;margin-bottom:16px;">${emoji}</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#1a1a2e;">
              Congratulations, ${escapeHtml(data.playerName)}!
            </h1>
            <p style="margin:0 0 24px;font-size:16px;color:#6b7280;text-align:center;">
              You won <strong style="color:#1a1a2e;">${escapeHtml(data.prizeName)}</strong> at ${escapeHtml(data.merchantName)}
            </p>
            <!-- Coupon Code Box -->
            <div style="background:linear-gradient(135deg,#f0f0ff 0%,#fdf2f8 100%);border:2px dashed #6366f1;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Coupon Code</div>
              <div style="font-size:32px;font-weight:800;color:#6366f1;letter-spacing:3px;font-family:monospace;">${escapeHtml(data.couponCode)}</div>
            </div>
            <!-- Validity -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Valid from</td>
                <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a2e;text-align:right;">${validFrom}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;border-top:1px solid #f0f0f0;">Valid until</td>
                <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a2e;text-align:right;border-top:1px solid #f0f0f0;">${validUntil}</td>
              </tr>
            </table>
            <!-- Instruction -->
            <div style="background:#f8fafc;border-radius:8px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#374151;font-weight:500;">
                Show this email or the coupon code to staff to redeem your prize
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;background:#f8fafc;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Powered by <strong>Win & Win</strong> &mdash; Gamified loyalty for local businesses
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
