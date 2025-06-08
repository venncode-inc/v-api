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

// === MIDDLEWARE ANTI DDOS - PASANG PERTAMA ===
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // Cek banned dulu
  if (bannedIPs.has(ip)) {
    const banExpires = bannedIPs.get(ip);
    if (now < banExpires) {
      // langsung blok, jangan next()
      return res.status(429).json({
        status: false,
        message: "Anda diblokir sementara karena aktivitas mencurigakan. Coba lagi nanti."
      });
    } else {
      // ban expired, hapus dari daftar banned & reset request count
      bannedIPs.delete(ip);
      ipRequests.delete(ip);
    }
  }

  // Hitung request IP ini dalam window waktu
  let reqData = ipRequests.get(ip) || { count: 0, startTime: now };

  if (now - reqData.startTime > WINDOW_TIME) {
    reqData = { count: 1, startTime: now };
  } else {
    reqData.count++;
  }

  ipRequests.set(ip, reqData);

  // Jika over limit, banned IP dan blok request ini
  if (reqData.count > RATE_LIMIT) {
    const banExpires = now + BAN_TIME;
    bannedIPs.set(ip, banExpires);

    sendDiscordAlert({
      ip,
      endpoint: req.originalUrl,
      ddosTime: new Date(now).toLocaleString(),
      banEndTime: new Date(banExpires).toLocaleString()
    });

    return res.status(429).json({
      status: false,
      message: "Anda diblokir sementara selama 5 menit karena aktivitas mencurigakan."
    });
  }
  next();
});

// === PARSER & CORS ===
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// === STATIC FILES ===
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// === RESPONSE JSON MODIFIER ===
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const responseData = {
        status: data.status,
        creator: settings.apiSettings.creator || "Hazel",
        ...data
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };
  next();
});

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
