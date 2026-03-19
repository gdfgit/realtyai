// netlify/functions/upload-docs.js
// Netlify serverless function to upload mortgage application documents to Google Drive
// Uses Google Service Account for authentication

const { google } = require('googleapis');
const { Readable } = require('stream');

// Service Account credentials (set these as Netlify environment variables)
const SERVICE_ACCOUNT_EMAIL = process.env.GDRIVE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GDRIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const PARENT_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Validate env vars
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !PARENT_FOLDER_ID) {
      console.error('Missing env vars:', {
        hasEmail: !!SERVICE_ACCOUNT_EMAIL,
        hasKey: !!PRIVATE_KEY,
        hasFolder: !!PARENT_FOLDER_ID,
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server misconfigured — missing Google Drive credentials' }),
      };
    }

    const body = JSON.parse(event.body);
    const { borrowerName, loanId, files } = body;
    // files = [{ name: "Borrower_PayStub.pdf", data: "base64string...", mimeType: "application/pdf" }, ...]

    if (!files || files.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No files provided' }) };
    }

    console.log(`Uploading ${files.length} file(s) for ${borrowerName}`);

    // Authenticate with Google Drive
    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive.file']
    );

    // Test auth before proceeding
    await auth.authorize();
    console.log('Google auth successful');

    const drive = google.drive({ version: 'v3', auth });

    // Create a subfolder for this loan application
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
    console.log(`Created subfolder: ${folderName} (${subfolderId})`);

    // Upload each file to the subfolder
    const uploadedFiles = [];
    for (const file of files) {
      try {
        if (!file.data) {
          console.error(`File ${file.name} has no data`);
          uploadedFiles.push({ name: file.name, error: 'No file data received' });
          continue;
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(file.data, 'base64');
        console.log(`Uploading ${file.name} (${buffer.length} bytes)`);

        if (buffer.length === 0) {
          console.error(`File ${file.name} decoded to 0 bytes`);
          uploadedFiles.push({ name: file.name, error: 'File decoded to 0 bytes' });
          continue;
        }

        // Determine MIME type
        let mimeType = file.mimeType || 'application/octet-stream';
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
          else if (file.name.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
          else if (file.name.endsWith('.png')) mimeType = 'image/png';
          else if (file.name.match(/\.(doc|docx)$/i)) mimeType = 'application/msword';
        }

        const fileRes = await drive.files.create({
          requestBody: {
            name: file.name,
            parents: [subfolderId],
          },
          media: {
            mimeType,
            body: bufferToStream(buffer),
          },
          fields: 'id, name, webViewLink',
        });

        console.log(`Uploaded ${file.name} -> ${fileRes.data.id}`);
        uploadedFiles.push({
          name: fileRes.data.name,
          id: fileRes.data.id,
          link: fileRes.data.webViewLink,
        });
      } catch (fileErr) {
        console.error(`Failed to upload ${file.name}:`, fileErr.message);
        uploadedFiles.push({ name: file.name, error: fileErr.message });
      }
    }

    const successCount = uploadedFiles.filter(f => !f.error).length;
    console.log(`Upload complete: ${successCount}/${files.length} succeeded`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        folderName,
        folderId: subfolderId,
        folderLink,
        files: uploadedFiles,
        count: successCount,
      }),
    };
  } catch (err) {
    console.error('Upload function error:', err.message, err.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
