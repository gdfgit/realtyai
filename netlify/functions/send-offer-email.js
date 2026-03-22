// netlify/functions/send-offer-email.js
// Sends offer notification emails directly through Gmail API
// Uses the SAME OAuth2 credentials that work for Google Drive uploads
// No EmailJS — direct Gmail send from nationrealtor@gmail.com

const { google } = require('googleapis');

const CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;

function buildHtmlEmail(params) {
  const { property_address, offer_price, message } = params;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#E31837,#C0141F);padding:28px 32px;border-radius:8px 8px 0 0;">
    <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">&#x1F4DD; New Offer Submitted</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Residential Purchase Agreement &mdash; Nevada</p>
  </div>
  <div style="background:#FFF8F0;border-left:4px solid #B8860B;padding:20px 32px;">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#B8860B;font-weight:700;margin:0 0 6px;">Property</p>
    <p style="font-size:18px;font-weight:700;color:#1A1A2E;margin:0;">${property_address}</p>
    <p style="font-size:22px;font-weight:700;color:#B8860B;margin:8px 0 0;">${offer_price}</p>
  </div>
  <div style="padding:28px 32px;border:1px solid #f0f0f0;border-top:none;">
    <h2 style="font-size:15px;color:#E31837;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;border-bottom:1px solid #f0f0f0;padding-bottom:10px;">Offer Details</h2>
    <pre style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.8;color:#2D2D3A;white-space:pre-wrap;word-wrap:break-word;margin:0;background:#FAFAFA;padding:20px;border-radius:8px;border:1px solid #f0f0f0;">${message}</pre>
  </div>
  <div style="background:#F8F7F4;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #f0f0f0;border-top:none;">
    <p style="font-size:13px;color:#6B6B7B;margin:0 0 8px;">This offer was generated via <strong style="color:#E31837;">Realty AI</strong> by Nation Realtor</p>
    <p style="font-size:12px;color:#999;margin:0;line-height:1.6;">
      Giancarlo Di Fazio | Axen Realty<br>
      DRE 02153044 | NV S.0185040<br>
      (949) 312-0103 | gdifaziorealtor@gmail.com<br>
      <a href="https://www.nationrealtor.com" style="color:#E31837;text-decoration:none;">nationrealtor.com</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildRawEmail({ to, cc, subject, htmlBody, fromName, fromEmail }) {
  const boundary = 'boundary_' + Date.now();
  const lines = [
    'From: ' + fromName + ' <' + fromEmail + '>',
    'To: ' + to,
  ];
  if (cc) lines.push('Cc: ' + cc);
  lines.push(
    'Subject: ' + subject,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    '--' + boundary + '--',
  );
  const raw = lines.join('\r\n');
  return Buffer.from(raw).toString('base64url');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      console.error('Missing OAuth env vars');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Gmail credentials' }) };
    }

    const body = JSON.parse(event.body);
    const { property_address, offer_price, message, listing_agent_email, listing_agent_name } = body;

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const subject = 'New Offer Submitted — ' + (property_address || 'Property') + ' — ' + (offer_price || 'TBD');
    const htmlBody = buildHtmlEmail({
      property_address: property_address || 'TBD',
      offer_price: offer_price || 'TBD',
      message: message || '',
    });

    const raw = buildRawEmail({
      to: 'gdifaziorealtor@gmail.com',
      cc: listing_agent_email || '',
      subject: subject,
      htmlBody: htmlBody,
      fromName: 'Realty AI',
      fromEmail: 'nationrealtor@gmail.com',
    });

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: raw },
    });

    console.log('Gmail sent, id:', result.data.id);

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, messageId: result.data.id }),
    };

  } catch (err) {
    console.error('Gmail send error:', err.message);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
