// netlify/functions/upload-docs.js
// Netlify serverless function to upload mortgage application documents to Google Drive
// Uses Google Service Account for authentication

const { google } = require('googleapis');

// Service Account credentials (set these as Netlify environment variables)
const SERVICE_ACCOUNT_EMAIL = process.env.GDRIVE_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GDRIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const PARENT_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

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
    const body = JSON.parse(event.body);
    const { borrowerName, loanId, files } = body;
    // files = [{ name: "Borrower_PayStub.pdf", data: "base64string...", mimeType: "application/pdf" }, ...]

    if (!files || files.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No files provided' }) };
    }

    // Authenticate with Google Drive
    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive.file']
    );
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

    // Upload each file to the subfolder
    const uploadedFiles = [];
    for (const file of files) {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(file.data, 'base64');

        // Determine MIME type
        let mimeType = file.mimeType || 'application/octet-stream';
        if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (file.name.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
        else if (file.name.endsWith('.png')) mimeType = 'image/png';

        const fileRes = await drive.files.create({
          requestBody: {
            name: file.name,
            parents: [subfolderId],
          },
          media: {
            mimeType,
            body: require('stream').Readable.from(buffer),
          },
          fields: 'id, name, webViewLink',
        });

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        folderName,
        folderId: subfolderId,
        folderLink,
        files: uploadedFiles,
        count: uploadedFiles.filter(f => !f.error).length,
      }),
    };
  } catch (err) {
    console.error('Upload function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
