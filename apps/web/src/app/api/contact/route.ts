import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ContactBody {
  businessName: string
  contactName: string
  email: string
  phone?: string
  businessType?: string
  message?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  let body: ContactBody & { type?: string; merchantId?: string; currentPlan?: string; desiredPlan?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle upgrade request
  if (body.type === 'upgrade_request') {
    console.log('[Upgrade Request]', {
      merchantId: body.merchantId,
      currentPlan: body.currentPlan,
      desiredPlan: body.desiredPlan,
      message: body.message,
      timestamp: new Date().toISOString(),
    })

    // Send notification email for upgrade request
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Win & Win <notifications@winandwin.fr>',
          to: ['douimiotmane@gmail.com'],
          subject: `Upgrade Request: ${body.currentPlan} -> ${body.desiredPlan}`,
          html: `
            <h2>Upgrade Request</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; font-weight: bold;">Merchant ID</td><td style="padding: 8px;">${escapeHtml(body.merchantId || 'N/A')}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Current Plan</td><td style="padding: 8px;">${escapeHtml(body.currentPlan || 'N/A')}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Desired Plan</td><td style="padding: 8px;">${escapeHtml(body.desiredPlan || 'N/A')}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${escapeHtml(body.message || 'N/A')}</td></tr>
            </table>
          `,
        }),
      }).catch((err) => {
        console.error('Failed to send upgrade notification email:', err)
      })
    }

    return NextResponse.json({ success: true })
  }

  // Validate required fields
  if (!body.businessName || typeof body.businessName !== 'string' || body.businessName.trim().length === 0) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
  }
  if (!body.contactName || typeof body.contactName !== 'string' || body.contactName.trim().length === 0) {
    return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })
  }
  if (!body.email || typeof body.email !== 'string' || !isValidEmail(body.email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const businessName = body.businessName.trim().slice(0, 200)
  const contactName = body.contactName.trim().slice(0, 100)
  const email = body.email.trim().slice(0, 255)
  const phone = body.phone?.trim().slice(0, 30) || null
  const businessType = body.businessType?.trim().slice(0, 50) || null
  const message = body.message?.trim() || null

  try {
    const db = getDb()
    await db.execute(
      sql`INSERT INTO contact_requests (id, business_name, contact_name, email, phone, business_type, message, status, created_at)
          VALUES (${id}, ${businessName}, ${contactName}, ${email}, ${phone}, ${businessType}, ${message}, 'new', now())`
    )
  } catch (err) {
    console.error('Failed to save contact request:', err)
    return NextResponse.json({ error: 'Failed to save your request. Please try again.' }, { status: 500 })
  }

  // Send notification email via Resend (non-blocking)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Win & Win <notifications@winandwin.fr>',
        to: ['douimiotmane@gmail.com'],
        subject: `New Contact Request: ${businessName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold;">Business Name</td><td style="padding: 8px;">${escapeHtml(businessName)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Contact Name</td><td style="padding: 8px;">${escapeHtml(contactName)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${escapeHtml(phone || 'N/A')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Business Type</td><td style="padding: 8px;">${escapeHtml(businessType || 'N/A')}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${escapeHtml(message || 'N/A')}</td></tr>
          </table>
        `,
      }),
    }).catch((err) => {
      console.error('Failed to send notification email:', err)
    })
  }

  return NextResponse.json({ success: true, id })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
