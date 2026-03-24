const fetch = require("node-fetch");

// Google Drive OAuth2 credentials (same as your other upload functions)
const CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;
// *** RESIDENTIAL LISTING folder ID ***
const PARENT_FOLDER_ID = "1FYBpGWC0_qldmWzVVUahBYxFH0gSY6xN";

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function createFolder(name, token) {
  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [PARENT_FOLDER_ID],
    }),
  });
  const data = await res.json();
  return data.id;
}

async function uploadFile(file, folderId, token) {
  const metadata = {
    name: file.name,
    parents: [folderId],
  };
  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: " + (file.mimeType || "application/octet-stream") + "\r\n" +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    file.data +
    closeDelimiter;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  return await res.json();
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { folderName, files } = JSON.parse(event.body);

    if (!files || files.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "No files to upload", folderLink: "" }),
      };
    }

    const token = await getAccessToken();

    // Create a subfolder for this listing
    const folderId = await createFolder(folderName || "New Listing", token);

    // Upload all files to the subfolder
    const results = [];
    for (const file of files) {
      const result = await uploadFile(file, folderId, token);
      results.push({ name: file.name, id: result.id });
    }

    const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Uploaded ${results.length} files`,
        folderLink,
        folderId,
        files: results,
      }),
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
