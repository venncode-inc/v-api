const axios = require('axios');

const deployTimestamp = new Date('2025-06-05T03:00:00Z');

// === Konfigurasi Redis Upstash (REST API) ===
const REDIS_URL = 'https://profound-ghost-47862.upstash.io';
const REDIS_AUTH = 'Basic ' + Buffer.from('default:Abr2AAIjcDFlNGZiYjEzNjhmNzc0MjljYjYzNzRmOTFkMWNmMjljMXAxMA').toString('base64');

// === Fungsi Redis ===
async function getTotalRequest() {
  const res = await axios.get(`${REDIS_URL}/get/totalRequest`, {
    headers: {
      Authorization: REDIS_AUTH
    }
  });
  return parseInt(res.data.result || '0');
}

async function incrementTotalRequest() {
  const res = await axios.get(`${REDIS_URL}/incr/totalRequest`, {
    headers: {
      Authorization: REDIS_AUTH
    }
  });
  return parseInt(res.data.result);
}

// === Fungsi format waktu ===
function formatRuntime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}j ${mins}m ${secs}d`;
}

function countRoutes() {
  return 1; // ubah sesuai total route kamu
}

// === Handler ===
module.exports = async function handler(req, res) {
  if (req.method === 'GET' && req.url === '/api-status/status') {
    try {
      const totalRequest = await incrementTotalRequest();
      const runtime = Date.now() - deployTimestamp.getTime();

      const result = {
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalfitur: countRoutes(),
          runtime: formatRuntime(runtime),
          domain: req.headers.host || 'unknown',
        }
      };

      res.status(200).json(result);

    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal akses Redis', error: err.message });
    }

  } else {
    res.status(404).json({ status: false, message: 'Endpoint tidak ditemukan' });
  }
};
