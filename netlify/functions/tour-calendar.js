// netlify/functions/tour-calendar.js
// Handles tour scheduling: check busy slots, book events, send emails, save to Drive
// Uses same OAuth2 credentials as Drive uploads and Gmail sends

const { google } = require('googleapis');
const { Readable } = require('stream');

const CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;
const TOUR_FOLDER_ID = '16mwK9Fc5CCUtVnlwUahu_ITgB3AJNeCe';

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return oauth2Client;
}

// GET: Check busy hours for a date
async function getBusyHours(date) {
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const timeMin = date + 'T00:00:00-07:00';
  const timeMax = date + 'T23:59:59-07:00';

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: 'America/Los_Angeles',
      items: [{ id: 'primary' }],
    },
  });

  const busy = res.data.calendars.primary.busy || [];
  const busyHours = [];
  for (const slot of busy) {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    // Mark each hour that overlaps with a busy period
    for (let h = start.getHours(); h < end.getHours() || (end.getMinutes() > 0 && h <= end.getHours()); h++) {
      if (busyHours.indexOf(h) === -1) busyHours.push(h);
    }
  }
  return busyHours;
}

// POST: Book a tour
async function bookTour(data) {
  const { date, hour, firstName, lastName, phone, email, addresses } = data;
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const gmail = google.gmail({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  const startTime = date + 'T' + (hour < 10 ? '0' + hour : hour) + ':00:00';
  const endHour = hour + 1;
  const endTime = date + 'T' + (endHour < 10 ? '0' + endHour : endHour) + ':00:00';

  const fullName = firstName + ' ' + lastName;
  const hrLabel = (hour % 12 || 12) + ':00 ' + (hour < 12 ? 'AM' : 'PM');
  const dateObj = new Date(date + 'T12:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // 1. Create calendar event
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: 'Property Tour — ' + fullName,
      description: 'Property Tour\\n\\nClient: ' + fullName + '\\nPhone: ' + phone + '\\nEmail: ' + email + '\\n\\nProperties:\\n' + addresses,
      start: { dateTime: startTime, timeZone: 'America/Los_Angeles' },
      end: { dateTime: endTime, timeZone: 'America/Los_Angeles' },
      attendees: [{ email: email }],
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 30 }] },
    },
  });
  console.log('Calendar event created:', event.data.id);

  // 2. Send confirmation email to client
  const clientHtml = buildClientEmail({ fullName, dateLabel, hrLabel, addresses, eventLink: event.data.htmlLink });
  const clientRaw = buildRawEmail({
    to: email,
    cc: '',
    subject: 'Tour Confirmed — ' + dateLabel + ' at ' + hrLabel,
    htmlBody: clientHtml,
    fromName: 'Nation Realtor',
    fromEmail: 'nationrealtor@gmail.com',
  });
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: clientRaw } });
  console.log('Confirmation email sent to:', email);

  // 3. Send notification email to agent
  const agentHtml = buildAgentEmail({ fullName, phone, email, dateLabel, hrLabel, addresses, eventLink: event.data.htmlLink });
  const agentRaw = buildRawEmail({
    to: 'gdifaziorealtor@gmail.com',
    cc: '',
    subject: 'New Tour Booked — ' + fullName + ' — ' + dateLabel + ' at ' + hrLabel,
    htmlBody: agentHtml,
    fromName: 'Realty AI',
    fromEmail: 'nationrealtor@gmail.com',
  });
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: agentRaw } });
  console.log('Agent notification sent');

  // 4. Save tour record to Google Drive
  const tourRecord = 'SCHEDULED TOUR\n' +
    '==============\n\n' +
    'Client: ' + fullName + '\n' +
    'Phone: ' + phone + '\n' +
    'Email: ' + email + '\n' +
    'Date: ' + dateLabel + '\n' +
    'Time: ' + hrLabel + '\n' +
    'Properties: ' + addresses + '\n' +
    'Calendar Event: ' + (event.data.htmlLink || '') + '\n' +
    'Booked: ' + new Date().toISOString() + '\n';

  const readable = new Readable({ read() { this.push(Buffer.from(tourRecord)); this.push(null); } });
  await drive.files.create({
    requestBody: {
      name: fullName + ' — ' + date + ' — Tour.txt',
      parents: [TOUR_FOLDER_ID],
    },
    media: { mimeType: 'text/plain', body: readable },
    fields: 'id',
  });
  console.log('Tour record saved to Drive');

  return { success: true, eventId: event.data.id };
}

function buildClientEmail({ fullName, dateLabel, hrLabel, addresses, eventLink }) {
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:\'Helvetica Neue\',Arial,sans-serif;background:#f5f5f5;">' +
    '<div style="max-width:640px;margin:0 auto;background:#ffffff;">' +
    '<div style="background:linear-gradient(135deg,#E31837,#C0141F);padding:28px 32px;border-radius:8px 8px 0 0;">' +
    '<h1 style="color:#ffffff;font-size:22px;margin:0;">&#x1F3E0; Tour Confirmed!</h1>' +
    '<p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Your property tour has been scheduled</p></div>' +
    '<div style="padding:28px 32px;">' +
    '<p style="font-size:15px;color:#1A1A2E;margin:0 0 16px;">Hi ' + fullName + ',</p>' +
    '<p style="font-size:14px;color:#2D2D3A;line-height:1.6;margin:0 0 20px;">Your property tour is confirmed. Here are the details:</p>' +
    '<div style="background:#FFF8F0;border-left:4px solid #B8860B;padding:16px 20px;border-radius:4px;margin:0 0 20px;">' +
    '<p style="font-size:12px;color:#B8860B;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Tour Details</p>' +
    '<p style="font-size:16px;font-weight:700;color:#1A1A2E;margin:0;">' + dateLabel + '</p>' +
    '<p style="font-size:18px;font-weight:700;color:#B8860B;margin:4px 0 0;">' + hrLabel + '</p>' +
    '<p style="font-size:13px;color:#2D2D3A;margin:12px 0 0;"><strong>Properties:</strong><br>' + addresses.replace(/\n/g, '<br>') + '</p></div>' +
    (eventLink ? '<p style="margin:0 0 20px;"><a href="' + eventLink + '" style="color:#E31837;font-weight:600;">Add to Google Calendar</a></p>' : '') +
    '<p style="font-size:13px;color:#6B6B7B;line-height:1.6;">If you need to reschedule, please call or text ' + AGENT_PHONE + '.</p></div>' +
    '<div style="background:#F8F7F4;padding:20px 32px;border-radius:0 0 8px 8px;border-top:1px solid #f0f0f0;">' +
    '<p style="font-size:12px;color:#999;margin:0;line-height:1.6;">' +
    'Giancarlo Di Fazio | Axen Realty<br>DRE 02153044 | NV S.0185040<br>(949) 312-0103 | gdifaziorealtor@gmail.com<br>' +
    '<a href="https://www.nationrealtor.com" style="color:#E31837;text-decoration:none;">nationrealtor.com</a></p></div></div></body></html>';
}

function buildAgentEmail({ fullName, phone, email, dateLabel, hrLabel, addresses, eventLink }) {
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:\'Helvetica Neue\',Arial,sans-serif;background:#f5f5f5;">' +
    '<div style="max-width:640px;margin:0 auto;background:#ffffff;">' +
    '<div style="background:linear-gradient(135deg,#E31837,#C0141F);padding:28px 32px;border-radius:8px 8px 0 0;">' +
    '<h1 style="color:#ffffff;font-size:22px;margin:0;">&#x1F4C5; New Tour Booked</h1>' +
    '<p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">A client has scheduled a property tour</p></div>' +
    '<div style="padding:28px 32px;">' +
    '<div style="background:#FFF8F0;border-left:4px solid #B8860B;padding:16px 20px;border-radius:4px;margin:0 0 20px;">' +
    '<p style="font-size:16px;font-weight:700;color:#1A1A2E;margin:0;">' + dateLabel + ' at ' + hrLabel + '</p></div>' +
    '<table style="width:100%;font-size:13px;color:#2D2D3A;line-height:1.8;">' +
    '<tr><td style="font-weight:700;width:100px;">Client:</td><td>' + fullName + '</td></tr>' +
    '<tr><td style="font-weight:700;">Phone:</td><td>' + phone + '</td></tr>' +
    '<tr><td style="font-weight:700;">Email:</td><td>' + email + '</td></tr>' +
    '<tr><td style="font-weight:700;">Properties:</td><td>' + addresses.replace(/\n/g, '<br>') + '</td></tr></table>' +
    (eventLink ? '<p style="margin:16px 0 0;"><a href="' + eventLink + '" style="color:#E31837;font-weight:600;">View Calendar Event</a></p>' : '') +
    '</div></div></body></html>';
}

const AGENT_PHONE = '(949) 312-0103';

function buildRawEmail({ to, cc, subject, htmlBody, fromName, fromEmail }) {
  const boundary = 'boundary_' + Date.now();
  const lines = ['From: ' + fromName + ' <' + fromEmail + '>', 'To: ' + to];
  if (cc) lines.push('Cc: ' + cc);
  lines.push(
    'Subject: ' + subject,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '', '--' + boundary,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '', htmlBody, '',
    '--' + boundary + '--',
  );
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing credentials' }) };
    }

    // GET: Check busy hours
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      if (params.action === 'busy' && params.date) {
        const busyHours = await getBusyHours(params.date);
        return { statusCode: 200, headers, body: JSON.stringify({ busyHours }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing action or date' }) };
    }

    // POST: Book tour
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      if (body.action === 'book') {
        const result = await bookTour(body);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('Tour calendar error:', err.message, err.stack);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
