const axios = require("axios");

async function uploadToAllServices(fileUrl) {
  const file = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(file.data);

  const boundary = "----HazelForm" + Date.now();
  const newline = "\r\n";

  const bodyStart =
    `--${boundary}${newline}` +
    `Content-Disposition: form-data; name="fileToUpload"; filename="upload.jpg"${newline}` +
    `Content-Type: application/octet-stream${newline}${newline}`;

  const bodyEnd = `${newline}--${boundary}--${newline}`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(bodyStart, "utf-8"),
    buffer,
    Buffer.from(bodyEnd, "utf-8")
  ]);

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": bodyBuffer.length
  };

  // Daftar layanan
  const targets = {
    catbox: "https://catbox.moe/user/api.php",
    uguu: "https://uguu.se/upload.php",
    vioo: "https://cdn.vioo.my.id/upload"
  };

  const results = {};

  for (const [name, url] of Object.entries(targets)) {
    try {
      const res = await axios.post(url, bodyBuffer, { headers });
      if (typeof res.data === "string" && res.data.startsWith("http")) {
        results[name] = res.data.trim();
      } else if (res.data?.url) {
        results[name] = res.data.url;
      } else {
        results[name] = "Upload gagal (format tidak dikenali)";
      }
    } catch (err) {
      results[name] = "Error: " + err.message;
    }
  }

  return results;
}

module.exports = function (app) {
  app.get("/tools/uploader", async (req, res) => {
    const fileUrl = req.query.url;

    if (!fileUrl) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' wajib diisi"
      });
    }

    try {
      const result = await uploadToAllServices(fileUrl);
      res.json({
        status: true,
        original: fileUrl,
        result
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        error: e.message
      });
    }
  });
};
