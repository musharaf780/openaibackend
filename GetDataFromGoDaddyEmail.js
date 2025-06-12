require("dotenv").config();
const express = require("express");
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");

const app = express();
const PORT = 3000;

// IMAP configuration from environment variables
const imapConfig = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT), // 993
    tls: true,
    authTimeout: 15000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

async function fetchEmails() {
  try {
    const connection = await imaps.connect(imapConfig);

    const boxes = await connection.getBoxes();
    console.log("Available folders:", Object.keys(boxes));

    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: [""], // "" fetches the entire message body (BODY[])
      struct: true,
      markSeen: false,
    };

    const results = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${results.length} emails.`);

    const emails = [];

    for (const res of results) {
      const part = res.parts.find((p) => p.which === "");
      if (!part || !part.body) continue;

      const parsed = await simpleParser(part.body);

      const attachments = (parsed.attachments || []).map((att) => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        content: att.content.toString("base64"), // optional: base64 for transport
      }));

      emails.push({
        subject: parsed.subject || "(No Subject)",
        from: parsed.from?.text || "",
        to: parsed.to?.text || "",
        date: parsed.date || "",
        text: parsed.text?.trim() || "",
        html: parsed.html || "",
        attachments,
      });
    }

    connection.end();
    return emails;
  } catch (error) {
    console.error("❌ Error fetching emails:", error.message);
    return [];
  }
}

// Route to return emails
app.get("/emails", async (req, res) => {
  const emails = await fetchEmails();
  res.json(emails);
});

// Start the server
app.listen(PORT, () => {
  console.log(`📬 Email API running at http://localhost:${PORT}`);
});
