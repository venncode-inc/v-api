const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

// ========== ANTI DDoS CONFIG ==========
let ipLogs = {};
let bannedIPs = {}; // { ip: expireTimestamp }

const BAN_TIME = 1000 * 60 * 5; // 5 menit blokir
const REQUEST_LIMIT = 10; // maksimal 10 request dalam 5 detik
const WINDOW_TIME = 5000; // 5 detik window

const WEBHOOK_URL = "https://discord.com/api/webhooks/1378430227277152357/-XjNAJKbxC6tj3Ihsr1oCRWzixvPuglPFU6WJGOAqchPi-ALtodQA7ixvmFK6hFjPcHH";

// Middleware Anti DDoS
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();

  if (bannedIPs[ip]) {
    if (bannedIPs[ip] > now) {
      return res.status(429).json({
        status: false,
        message: `Your IP ${ip} is temporarily banned until ${new Date(bannedIPs[ip]).toISOString()}`
      });
    } else {
      delete bannedIPs[ip];
    }
  }

  if (!ipLogs[ip]) ipLogs[ip] = [];
  ipLogs[ip] = ipLogs[ip].filter(t => now - t < WINDOW_TIME);
  ipLogs[ip].push(now);

  if (ipLogs[ip].length > REQUEST_LIMIT) {
    bannedIPs[ip] = now + BAN_TIME;

    axios.post(WEBHOOK_URL, {
      content: "@everyone",
      embeds: [
        {
          title: "🚨 DDoS Detected & IP Banned",
          description: `**IP:** \`${ip}\`\n**Requests in 5s:** \`${ipLogs[ip].length}\`\n**Banned until:** ${new Date(bannedIPs[ip]).toISOString()}`,
          color: 0xFF0000,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Hazelnut Security"
          }
        }
      ]
    }).catch(err => console.error("Gagal kirim webhook:", err.message));

    ipLogs[ip] = [];

    return res.status(429).json({
      status: false,
      message: `Your IP ${ip} is temporarily banned due to too many requests`
    });
  }

  next();
});

// ========== SETUP DASAR ==========
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// ========== CUSTOM JSON RESPON ==========
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const responseData = {
        status: data.status,
        creator: settings.apiSettings.creator || "Created Using Rynn UI",
        ...data
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };
  next();
});

// ========== ROUTE ADMIN BANNED ==========
app.get('/admin/banned', (req, res) => {
  const now = Date.now();
  const activeBans = Object.entries(bannedIPs)
    .filter(([ip, expire]) => expire > now)
    .map(([ip, expire]) => ({
      ip,
      bannedUntil: new Date(expire).toISOString(),
      remainingMs: expire - now
    }));

  res.json({
    status: true,
    creator: "Hazel",
    bannedCount: activeBans.length,
    bannedIPs: activeBans
  });
});

// ========== ROUTE UTAMA ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// ========== ERROR HANDLER ==========
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(`Server is running on port ${PORT}`));
});

module.exports = app;
