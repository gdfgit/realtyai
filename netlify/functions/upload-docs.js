// netlify/functions/upload-docs.js
// Uploads mortgage documents to Google Drive using OAuth2 (as nationrealtor@gmail.com)
// This avoids the "Service Accounts do not have storage quota" error

const { google } = require('googleapis');
const { Readable } = require('stream');

const CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;
const PARENT_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

function bufferToStream(buffer) {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
  return readable;
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
    // Validate env vars
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !PARENT_FOLDER_ID) {
      console.error('Missing env vars:', {
        hasClientId: !!CLIENT_ID,
        hasClientSecret: !!CLIENT_SECRET,
        hasRefreshToken: !!REFRESH_TOKEN,
        hasFolder: !!PARENT_FOLDER_ID,
      });
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: 'Server misconfigured — missing Google Drive credentials' }),
      };
    }

    const bodySize = event.body ? event.body.length : 0;
    console.log(`Request body size: ${bodySize} bytes (${(bodySize / 1024 / 1024).toFixed(2)} MB)`);

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseErr) {
      console.error('JSON parse failed. Size:', bodySize);
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { borrowerName, loanId, files } = body;

    if (!files || files.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No files provided' }) };
    }

    console.log(`Uploading ${files.length} file(s) for ${borrowerName}`);

    // ═══ OAuth2 authentication (as nationrealtor@gmail.com) ═══
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    // Force a token refresh to verify credentials work
    await oauth2Client.getAccessToken();
    console.log('OAuth2 auth OK');

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Create subfolder for this loan
    const today = new Date().toISOString().slice(0, 10);
    const folderName = `${borrowerName || 'Unknown'} — ${today} — ${loanId || 'pending'}`;

    const folderRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [PARENT_FOLDER_ID],
      },
      fields: 'id, webViewLink',
    });

    const subfolderId = folderRes.data.id;
    const folderLink = folderRes.data.webViewLink;
    console.log(`Created folder: ${folderName} (${subfolderId})`);

    // Upload each file
    const uploadedFiles = [];
    for (const file of files) {
      try {
        if (!file.data) {
          uploadedFiles.push({ name: file.name, error: 'No file data' });
          continue;
        }

        const buffer = Buffer.from(file.data, 'base64');
        console.log(`File: ${file.name} | b64: ${file.data.length} | decoded: ${buffer.length} bytes`);

        if (buffer.length === 0) {
          uploadedFiles.push({ name: file.name, error: '0 bytes after decode' });
          continue;
        }

        // Determine MIME type
        let mimeType = file.mimeType || 'application/octet-stream';
        const n = file.name.toLowerCase();
        if (n.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (n.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
        else if (n.endsWith('.png')) mimeType = 'image/png';
        else if (n.match(/\.(doc|docx)$/)) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Ensure extension
        let fileName = file.name;
        if (!fileName.match(/\.\w+$/)) {
          if (mimeType === 'application/pdf') fileName += '.pdf';
          else if (mimeType === 'image/jpeg') fileName += '.jpg';
          else if (mimeType === 'image/png') fileName += '.png';
        }

        console.log(`Uploading: ${fileName} (${mimeType}, ${buffer.length} bytes)`);

        const fileRes = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [subfolderId],
          },
          media: {
            mimeType,
            body: bufferToStream(buffer),
          },
          fields: 'id, name, webViewLink',
        });

        console.log(`Uploaded OK: ${fileRes.data.name} -> ${fileRes.data.id}`);
        uploadedFiles.push({
          name: fileRes.data.name,
          id: fileRes.data.id,
          link: fileRes.data.webViewLink,
        });

      } catch (fileErr) {
        console.error(`FAIL ${file.name}:`, fileErr.message);
        uploadedFiles.push({ name: file.name, error: fileErr.message });
      }
    }

    const successCount = uploadedFiles.filter(f => !f.error).length;
    console.log(`Done: ${successCount}/${files.length} uploaded`);

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true, folderName, folderId: subfolderId, folderLink,
        files: uploadedFiles, count: successCount,
      }),
    };

  } catch (err) {
    console.error('Function error:', err.message, err.stack);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
