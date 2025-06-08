const axios = require('axios');

let totalRequest = 0;
let requestHarian = {};
let requestBulanan = {};

// Ganti ini dengan waktu deploy asli (UTC)
const deployTimestamp = new Date('2025-06-05T03:00:00Z');

module.exports = function (app) {
  app.use((req, res, next) => {
    totalRequest++;

    const now = new Date();
    const hari = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const bulan = now.toISOString().slice(0, 7);   // YYYY-MM

    requestHarian[hari] = (requestHarian[hari] || 0) + 1;
    requestBulanan[bulan] = (requestBulanan[bulan] || 0) + 1;

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

  app.get('/api-status/status', async (req, res) => {
    try {
      const runtime = Date.now() - deployTimestamp.getTime();
      const domain = req.hostname;
      const totalfitur = countRoutes();

      const now = new Date();
      const hari = now.toISOString().split('T')[0];
      const bulan = now.toISOString().slice(0, 7);

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalrequestharian: requestHarian[hari]?.toString() || "0",
          totalrequestbulanan: requestBulanan[bulan]?.toString() || "0",
          totalfitur: totalfitur,
          runtime: formatRuntime(runtime),
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
