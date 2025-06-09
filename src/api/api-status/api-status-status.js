import axios from "axios";
import Redis from "ioredis";

const redis = new Redis("rediss://default:Abr2AAIjcDFlNGZiYjEzNjhmNzc0MjljYjYzNzRmOTFkMWNmMjljMXAxMA@profound-ghost-47862.upstash.io:6379");

const deployTimestamp = new Date('2025-06-05T03:00:00Z');

function countRoutes() {
  return 1;
}

function formatRuntime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}j ${mins}m ${secs}d`;
}

export default async function handler(req, res) {
  if (req.method === 'GET' && req.url === '/api-status/status') {
    try {
      // ambil & tambah totalRequest di Redis
      const totalReq = await redis.incr('totalRequest');

      const runtime = Date.now() - deployTimestamp.getTime();

      const result = {
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalReq.toString(),
          totalfitur: countRoutes(),
          runtime: formatRuntime(runtime),
          domain: req.headers.host || 'unknown',
        }
      };

      res.status(200).json(result);

    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal ambil data dari Redis',
        error: err.message
      });
    }

  } else {
    res.status(404).json({
      status: false,
      message: 'Endpoint tidak ditemukan'
    });
  }
}
