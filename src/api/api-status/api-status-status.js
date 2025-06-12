const axios = require('axios');

const SUPABASE_URL = 'https://cxdjoetjwtpaflqgehig.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZGpvZXRqd3RwYWZscWdlaGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODkwNzksImV4cCI6MjA2NTA2NTA3OX0.LlHWi2YXeL9p_Juhz_FwPW_Vu2C958xZ02ybp_Cix80';

const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

let totalRequest = 0;
const deployTimestamp = new Date('2025-06-05T03:00:00Z');
let serverRegion = 'unknown';

(async () => {
  try {
    const res = await axios.get('https://www.cloudflare.com/cdn-cgi/trace');
    const data = Object.fromEntries(
      res.data.trim().split('\n').map(line => line.split('='))
    );
    serverRegion = data.loc || 'unknown';
  } catch {
    serverRegion = 'unknown';
  }
})();

// Ambil count awal dari Supabase
(async () => {
  try {
    const { data } = await axios.get(
      `${SUPABASE_URL}/rest/v1/request_counter?id=eq.1&select=count`,
      { headers: supabaseHeaders }
    );
    if (data.length > 0) {
      totalRequest = data[0].count;
    } else {
      await axios.post(
        `${SUPABASE_URL}/rest/v1/request_counter`,
        { id: 1, count: 0 },
        { headers: supabaseHeaders }
      );
    }
  } catch (e) {
    console.error('Gagal ambil data awal dari Supabase:', e.message);
  }
})();

module.exports = function (app) {
  app.use(async (req, res, next) => {
    totalRequest++;

    try {
      await axios.patch(
        `${SUPABASE_URL}/rest/v1/request_counter?id=eq.1`,
        { count: totalRequest },
        { headers: supabaseHeaders }
      );
    } catch (e) {
      console.error('Gagal update count ke Supabase:', e.message);
    }

    next();
  });

  function countRoutes() {
    let routeCount = 0;
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routeCount++;
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) routeCount++;
        });
      }
    });
    return routeCount;
  }

  function formatRuntime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}j ${mins}m ${secs}d`;
  }

  async function testSpeed() {
    const start = Date.now();
    try {
      await axios.get('https://www.google.com/generate_204', { timeout: 3000 });
      return `${Date.now() - start} ms`;
    } catch {
      return 'timeout';
    }
  }

  app.get('/api-status/status', async (req, res) => {
    try {
      const runtime = Date.now() - deployTimestamp.getTime();
      const domain = req.hostname;
      const totalfitur = countRoutes();
      const speed = await testSpeed();

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalfitur: totalfitur,
          runtime: formatRuntime(runtime),
          speed: speed,
          region: serverRegion,
          domain: domain
        }
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil status',
        error: e.message
      });
    }
  });
};
