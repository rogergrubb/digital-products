import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'support@leaderlaunch.co';
const RESEND_KEY = process.env.RESEND_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'LeaderLaunch Support <support@leaderlaunch.co>';
// If using Resend's free tier without custom domain, use: 'onboarding@resend.dev'
const FROM_EMAIL_FALLBACK = 'LeaderLaunch Support <onboarding@resend.dev>';

// ═══════════════════════════════════════
// LOAD KNOWLEDGE BASE
// ═══════════════════════════════════════
let knowledge;
try {
  const kbPath = join(process.cwd(), 'knowledge', 'products.json');
  knowledge = JSON.parse(readFileSync(kbPath, 'utf-8'));
} catch (e) {
  knowledge = { company: {}, products: {}, common_issues: {}, tone_guidelines: '' };
}

// ═══════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════
function autoReplyHTML(name, product, ticketId) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2a2a2a;">
  <div style="border-bottom: 3px solid #c8973e; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="color: #0f2b46; margin: 0; font-size: 20px;">We've received your message</h2>
  </div>
  <p>Hi ${name},</p>
  <p>Thanks for reaching out about <strong>${product}</strong>. We've received your support request and our team is on it.</p>
  <p><strong>Your ticket ID:</strong> ${ticketId}</p>
  <p>You'll receive a detailed response shortly — most requests are resolved within a few minutes. For complex issues, we'll follow up within 24 hours.</p>
  <p style="margin-top: 24px;">— The LeaderLaunch Team</p>
  <div style="border-top: 1px solid #e0e0e0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #888;">
    <p>LeaderLaunch · Digital tools for professionals who lead</p>
  </div>
</body>
</html>`;
}

function aiResponseHTML(name, product, aiMessage, ticketId) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2a2a2a;">
  <div style="border-bottom: 3px solid #c8973e; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="color: #0f2b46; margin: 0; font-size: 20px;">Here's what we found</h2>
  </div>
  <p>Hi ${name},</p>
  <p>Regarding your question about <strong>${product}</strong>:</p>
  <div style="background: #f7f5f0; border-left: 4px solid #c8973e; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; line-height: 1.6;">
    ${aiMessage.replace(/\n/g, '<br>')}
  </div>
  <p>If this doesn't fully resolve your issue, just reply to this email and a human will follow up within 24 hours.</p>
  <p style="margin-top: 24px;">— The LeaderLaunch Team</p>
  <div style="border-top: 1px solid #e0e0e0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #888;">
    <p>Ticket ID: ${ticketId} · LeaderLaunch · Digital tools for professionals who lead</p>
  </div>
</body>
</html>`;
}

function ownerNotificationHTML(name, email, product, issueType, message, ticketId, aiResponse) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2a2a2a;">
  <div style="background: #0f2b46; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">🎫 New Support Ticket: ${ticketId}</h2>
  </div>
  <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #888; width: 100px;"><strong>From:</strong></td><td>${name} (${email})</td></tr>
      <tr><td style="padding: 6px 0; color: #888;"><strong>Product:</strong></td><td>${product}</td></tr>
      <tr><td style="padding: 6px 0; color: #888;"><strong>Type:</strong></td><td>${issueType}</td></tr>
      <tr><td style="padding: 6px 0; color: #888;"><strong>Time:</strong></td><td>${new Date().toISOString()}</td></tr>
    </table>
    <h3 style="color: #0f2b46; margin: 20px 0 8px;">Customer Message</h3>
    <div style="background: #f7f5f0; padding: 14px; border-radius: 6px; line-height: 1.6;">${message}</div>
    <h3 style="color: #0f2b46; margin: 20px 0 8px;">AI Auto-Response Sent</h3>
    <div style="background: #eef7ee; padding: 14px; border-radius: 6px; line-height: 1.6; border-left: 4px solid #2d8a4e;">${aiResponse.replace(/\n/g, '<br>')}</div>
    <p style="margin-top: 16px; font-size: 13px; color: #888;">Reply directly to the customer at: <a href="mailto:${email}">${email}</a></p>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════
// AI SUPPORT BOT
// ═══════════════════════════════════════
async function getAIResponse(customerName, product, issueType, message) {
  if (!ANTHROPIC_KEY) {
    // Demo mode fallback
    return getFallbackResponse(issueType, product);
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const productData = knowledge.products[product] || {};
  const systemPrompt = `You are a friendly, professional customer support agent for LeaderLaunch, a company that sells digital professional development products (PDF guides, toolkits, templates).

COMPANY INFO:
${JSON.stringify(knowledge.company, null, 2)}

PRODUCT INFO:
${JSON.stringify(productData, null, 2)}

COMMON ISSUE RESOLUTIONS:
${JSON.stringify(knowledge.common_issues, null, 2)}

TONE: ${knowledge.tone_guidelines}

RULES:
- Keep responses under 150 words
- Be warm, helpful, and specific
- Always provide a clear next step
- If you can resolve the issue directly, do so
- If it requires human intervention (refund processing, bulk pricing, account issues), acknowledge the request and say the team will follow up within 24 hours
- Never make up information about products
- Never share internal processes or pricing logic
- Do not use markdown formatting — write in plain text with line breaks
- Sign off as "The LeaderLaunch Team"`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Customer: ${customerName}\nProduct: ${productData.name || product}\nIssue Type: ${issueType}\n\nCustomer's message:\n${message}`
      }]
    });

    return response.content[0].text;
  } catch (err) {
    console.error('AI error:', err.message);
    return getFallbackResponse(issueType, product);
  }
}

function getFallbackResponse(issueType, product) {
  const responses = {
    'download': knowledge.common_issues?.cant_download || 'Please check your browser download history. If you still need help, our team will follow up within 24 hours.',
    'refund': knowledge.common_issues?.refund_request || 'Your refund request has been noted. Our team will process it within 1-2 business days.',
    'payment': knowledge.common_issues?.payment_failed || 'Please try again with a different payment method. If the issue persists, your bank may need to authorize the transaction.',
    'question': `Thank you for your question about ${product}. Our team will review your message and respond within 24 hours.`,
    'bulk': knowledge.common_issues?.bulk_pricing || 'We offer volume discounts for teams. Our team will follow up with pricing options.',
    'other': knowledge.common_issues?.other || 'Thank you for reaching out. Our team will review your message and get back to you within 24 hours.'
  };
  return responses[issueType] || responses['other'];
}

// ═══════════════════════════════════════
// SEND EMAILS
// ═══════════════════════════════════════
async function sendEmail(to, subject, html, replyTo) {
  if (!RESEND_KEY) {
    console.log(`[DEMO MODE] Would send email to: ${to} | Subject: ${subject}`);
    return { id: 'demo_' + Date.now() };
  }

  const resend = new Resend(RESEND_KEY);
  const fromAddr = process.env.FROM_EMAIL || FROM_EMAIL_FALLBACK;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddr,
      to: [to],
      subject,
      html,
      reply_to: replyTo || OWNER_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, product, issueType, message, orderNumber } = req.body;

    // ── Validate ──
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, message' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // ── Generate ticket ID ──
    const ticketId = `LDR-${Date.now().toString(36).toUpperCase()}`;
    const productSlug = product || 'general';
    const type = issueType || 'other';
    const productName = knowledge.products[productSlug]?.name || productSlug;

    console.log(`[TICKET] ${ticketId} | ${name} | ${email} | ${productName} | ${type}`);

    // ── Step 1: Send auto-reply ──
    await sendEmail(
      email,
      `We've received your message — Ticket ${ticketId}`,
      autoReplyHTML(name, productName, ticketId)
    );

    // ── Step 2: Get AI response ──
    const aiResponse = await getAIResponse(name, productSlug, type, message);

    // ── Step 3: Send AI resolution to customer ──
    await sendEmail(
      email,
      `Re: Your ${productName} question — ${ticketId}`,
      aiResponseHTML(name, productName, aiResponse, ticketId)
    );

    // ── Step 4: Notify owner ──
    await sendEmail(
      OWNER_EMAIL,
      `🎫 [${type.toUpperCase()}] ${ticketId} — ${name} (${productName})`,
      ownerNotificationHTML(name, email, productName, type, message, ticketId, aiResponse),
      email // reply-to is the customer
    );

    // ── Respond to form ──
    return res.status(200).json({
      success: true,
      ticketId,
      message: 'Support request received. Check your email for a response.',
      demo: !RESEND_KEY || !ANTHROPIC_KEY
    });

  } catch (err) {
    console.error('[SUPPORT ERROR]', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
