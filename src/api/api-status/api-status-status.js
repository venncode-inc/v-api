const axios = require('axios');

let totalRequest = 0;
const deployTimestamp = new Date('2025-06-05T03:00:00Z');

let serverRegion = 'unknown';

// Fetch sekali pas awal jalan
(async () => {
  try {
    const res = await axios.get('https://www.cloudflare.com/cdn-cgi/trace');
    const data = Object.fromEntries(
      res.data
        .trim()
        .split('\n')
        .map(line => line.split('='))
    );
    serverRegion = data.loc || 'unknown';
  } catch {
    serverRegion = 'unknown';
  }
})();

module.exports = function (app) {
  app.use((req, res, next) => {
    totalRequest++;
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
