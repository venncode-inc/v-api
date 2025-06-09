const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;
app.enable("trust proxy");
app.set("json spaces", 2);

// === CONSTANTS & VARIABLES ===
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

const requestLogWebhookURL = 'https://discord.com/api/webhooks/1381323318015168713/n7-0frn24IaSz4BXK3nD6TnLTYKzNq8iZxq8RWkUDmEF0P35Dz_9o_ALgjDQkyFx78h9';
const discordWebhookURL = 'https://discord.com/api/webhooks/1378430227277152357/-XjNAJKbxC6tj3Ihsr1oCRWzixvPuglPFU6WJGOAqchPi-ALtodQA7ixvmFK6hFjPcHH';

const RATE_LIMIT = 20;
const WINDOW_TIME = 10 * 1000;
const BAN_TIME = 5 * 60 * 1000;
const ipRequests = new Map();
const bannedIPs = new Map();

// === FUNCTION: SEND ALERT KE DISCORD ===
function sendDiscordAlert({ ip, endpoint, ddosTime, banEndTime }) {
  const embed = {
    title: "DDOS ACTIVITY DETECTED",
    color: 0xff0000,
    fields: [
      { name: "Alamat IP", value: ip, inline: true },
      { name: "Endpoint", value: endpoint, inline: true },
      { name: "Waktu", value: ddosTime, inline: false },
      { name: "Waktu Ban", value: banEndTime, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `Anti Ban | ${new Date().toLocaleString()}`
    }
  };

  return axios.post(discordWebhookURL, {
    content: "@everyone",
    embeds: [embed]
  }).catch(err => {
    console.error('Failed to send Discord webhook:', err.message);
  });
}

function sendRequestLog({ status, endpoint, ip, requestCount }) {
  const embed = {
    title: "REQUEST API'S",
    color: 0x00ffff,
    fields: [
      { name: "Status", value: String(status), inline: true },
      { name: "Endpoint", value: endpoint, inline: true },
      { name: "Jumlah Request", value: String(requestCount), inline: false },
    ],
    footer: {
      text: `${ip} | ${new Date().toLocaleString()}`
    },
    timestamp: new Date().toISOString()
  };

  return axios.post(requestLogWebhookURL, {
    embeds: [embed]
  }).catch(err => {
    console.error('Failed to send request log webhook:', err.message);
  });
}

// === MIDDLEWARE KOMBINASI (ANTI-DDOS + RESPONSE WRAPPER + LOGGING) ===
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const endpoint = req.originalUrl;
  const now = Date.now();

  // Cek IP apakah sedang di-banned
  if (bannedIPs.has(ip)) {
    const banEnd = bannedIPs.get(ip);
    if (now < banEnd) {
      return res.status(403).json({
        status: false,
        message: "You are temporarily banned due to suspicious activity."
      });
    } else {
      bannedIPs.delete(ip);
    }
  }

  // Hitung request IP
  const requestData = ipRequests.get(ip) || { count: 0, startTime: now };
  if (now - requestData.startTime < WINDOW_TIME) {
    requestData.count++;
  } else {
    requestData.count = 1;
    requestData.startTime = now;
  }
  ipRequests.set(ip, requestData);

  // Jika melewati limit ➜ BANNED
  if (requestData.count > RATE_LIMIT) {
    const banEndTime = now + BAN_TIME;
    bannedIPs.set(ip, banEndTime);

    sendDiscordAlert({
      ip,
      endpoint,
      ddosTime: new Date(now).toLocaleString(),
      banEndTime: new Date(banEndTime).toLocaleString()
    });

    return res.status(429).json({
      status: false,
      message: "Too many requests. You are temporarily banned."
    });
  }

  // Simpan referensi original res.json
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      // Kirim webhook log request
      sendRequestLog({
        status: data.status ?? true,
        endpoint,
        ip,
        requestCount: requestData.count
      });

      // Tambah metadata ke response
      const responseData = {
        status: data.status ?? true,
        creator: settings.apiSettings.creator || "Hazel",
        ...data
      };
      return originalJson.call(this, responseData);
    }

    return originalJson.call(this, data);
  };

  next();
});

// === PARSER & CORS ===
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// === STATIC FILES ===
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// === LOAD ROUTES DARI FOLDER API ===
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder);
  if (fs.statSync(subfolderPath).isDirectory()) {
    fs.readdirSync(subfolderPath).forEach((file) => {
      const filePath = path.join(subfolderPath, file);
      if (path.extname(file) === '.js') {
        require(filePath)(app);
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
      }
    });
  }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

// === ROUTE HOME ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// === 404 PAGE ===
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "api-page", "404.html"));
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, "api-page", "500.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
