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

// === SETTINGS ===
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

const discordWebhookURL = 'https://discord.com/api/webhooks/1381323318015168713/n7-0frn24IaSz4BXK3nD6TnLTYKzNq8iZxq8RWkUDmEF0P35Dz_9o_ALgjDQkyFx78h9';

const RATE_LIMIT = 10;
const WINDOW_TIME = 5 * 1000;
const BAN_TIME = 3 * 60 * 1000;
const ipRequests = new Map();
const bannedIPs = new Map();

// === WHITELIST IP ===
let whitelistedIPs = [];

async function loadWhitelist() {
  try {
    const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/main/whitelist.json');
    if (Array.isArray(data)) {
      whitelistedIPs = data;
      console.log(chalk.green(`[Whitelist Loaded] ${whitelistedIPs.length} IPs`));
    } else {
      console.error('[Whitelist Error] Format JSON bukan array');
    }
  } catch (err) {
    console.error('[Whitelist Load Error]', err.message);
  }
}

loadWhitelist();
setInterval(loadWhitelist, 5 * 60 * 1000); // refresh setiap 5 menit

// === WEBHOOK LOGGER ===
function sendDiscordAlert({ ip, endpoint, ddosTime, banEndTime, headers }) {
  const embed = {
    title: "🚨 DDoS Detected",
    color: 0xff0000,
    fields: [
      { name: "IP", value: ip, inline: true },
      { name: "Endpoint", value: endpoint, inline: true },
      { name: "Time", value: ddosTime, inline: false },
      { name: "Ban Until", value: banEndTime, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Hazel Anti-DDoS System" }
  };

  return axios.post(discordWebhookURL, {
    content: "⚠️ Suspicious Traffic Detected",
    embeds: [embed]
  }).catch(err => {
    console.error('[Webhook Failed]', err.message);
  });
}

function sendRawRequestLog({ ip, path, headers }) {
  return axios.post(discordWebhookURL, {
    content: `📩 Blocked Request:\nIP: ${ip}\nPath: ${path}\nHeaders:\n\`\`\`json\n${JSON.stringify(headers, null, 2)}\n\`\`\``
  }).catch(() => {});
}

// === MIDDLEWARE UTAMA ===
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const endpoint = req.originalUrl;
  const now = Date.now();

  // Lewati anti-DDoS jika IP termasuk whitelist
  if (whitelistedIPs.includes(ip)) {
    return next();
  }

  // If banned, log every request to Discord, block it
  if (bannedIPs.has(ip)) {
    const banEnd = bannedIPs.get(ip);
    if (now < banEnd) {
      sendRawRequestLog({ ip, path: endpoint, headers: req.headers });
      return res.status(403).json({
        status: false,
        antiddos: true,
        blocked: true,
        ip: ip,
        until: new Date(bannedIPs.get(ip)).toISOString(),
        message: "🚫 Akses dari IP ini diblokir.",
        reason: "Deteksi serangan DDoS dari alamat ip ini"
      });
    } else {
      bannedIPs.delete(ip);
    }
  }

  // Rate limiting
  const requestData = ipRequests.get(ip) || { count: 0, startTime: now };
  if (now - requestData.startTime < WINDOW_TIME) {
    requestData.count++;
  } else {
    requestData.count = 1;
    requestData.startTime = now;
  }
  ipRequests.set(ip, requestData);

  // DDoS detected
  if (requestData.count > RATE_LIMIT) {
    const banEndTime = now + BAN_TIME;
    bannedIPs.set(ip, banEndTime);

    sendDiscordAlert({
      ip,
      endpoint,
      ddosTime: new Date(now).toLocaleString(),
      banEndTime: new Date(banEndTime).toLocaleString(),
      headers: req.headers
    });

    console.log(chalk.red(`[DDoS Blocked] ${ip} @ ${endpoint}`));
    req.destroy(); // kill connection instantly
    return;
  }

  // Wrap response
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const wrapped = {
        status: data.status ?? true,
        creator: settings.apiSettings.creator || "Hazel",
        ...data
      };
      return originalJson.call(this, wrapped);
    }
    return originalJson.call(this, data);
  };

  next();
});

// === MIDDLEWARE LAINNYA ===
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// === STATIC FILES ===
app.use('/', express.static(path.join(__dirname, 'home')));
app.use('/api-page', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// === LOAD ROUTES ===
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
        console.log(chalk.bgHex('#FFFF99').hex('#333')(` Loaded: ${file} `));
      }
    });
  }
});
console.log(chalk.bgGreen.hex('#000')(` ✅ Loaded ${totalRoutes} routes `));

// === HOMEPAGE ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// === 404 ===
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', 'akses.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(chalk.bgGreen.hex('#000')(` 🚀 Server Running at Port ${PORT} `));
});

module.exports = app;
