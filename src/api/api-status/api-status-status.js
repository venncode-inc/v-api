const axios = require('axios');
const Redis = require('ioredis');

// koneksi Redis Upstash
const client = new Redis("rediss://default:Abr2AAIjcDFlNGZiYjEzNjhmNzc0MjljYjYzNzRmOTFkMWNmMjljMXAxMA@profound-ghost-47862.upstash.io:6379");

// waktu deploy
const deployTimestamp = new Date('2025-06-05T03:00:00Z');

// jumlah fitur (ubah sesuai endpoint asli kamu)
function countRoutes() {
  return 1;
}

// format runtime API
function formatRuntime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}j ${mins}m ${secs}d`;
}

// handler utama
module.exports = async function handler(req, res) {
  if (req.method === 'GET' && req.url === '/api-status/status') {
    try {
      await client.incr('totalRequest'); // tambah 1
      const total = await client.get('totalRequest');

      const runtime = Date.now() - deployTimestamp.getTime();

      res.status(200).json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: total,
          totalfitur: countRoutes(),
          runtime: formatRuntime(runtime),
          domain: req.headers.host || 'unknown',
        }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal ambil data dari Redis',
        error: err.message
      });
    }
  } else {
    res.status(404).json({ status: false, message: 'Endpoint tidak ditemukan' });
  }
};
