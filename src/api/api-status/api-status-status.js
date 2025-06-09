const axios = require('axios');

const QSTASH_URL = 'https://qstash.upstash.io/v2/publish/https://zelapioffciall.vercel.app/push';
const QSTASH_TOKEN = 'Bearer eyJVc2VySUQiOiIxNGJiM2JmMS1iY2MwLTQ2MjYtOWE2Ny01NzE2NTU2ZTY5MzciLCJQYXNzd29yZCI6IjBkNGJiMzQ2NmM2YzRjZDdiZTRmYjQ2ZmE1NDYxZGQ0In0=';

const ENDPOINT_GET = 'https://zelapioffciall.vercel.app/push'; // ini untuk GET data lama
const deployTimestamp = new Date('2025-06-05T03:00:00Z');

module.exports = function (app) {
  app.use(async (req, res, next) => {
    try {
      // ambil data lama
      const { data } = await axios.get(ENDPOINT_GET);

      const now = new Date();
      const hari = now.toISOString().split('T')[0];
      const bulan = now.toISOString().slice(0, 7);

      const totalRequest = (data.totalRequest || 0) + 1;
      const requestHarian = data.requestHarian || {};
      const requestBulanan = data.requestBulanan || {};

      requestHarian[hari] = (requestHarian[hari] || 0) + 1;
      requestBulanan[bulan] = (requestBulanan[bulan] || 0) + 1;

      // kirim ke QStash push
      await fetch(QSTASH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': QSTASH_TOKEN
        },
        body: JSON.stringify({
          totalRequest,
          requestHarian,
          requestBulanan
        })
      });

      req.statData = {
        totalRequest,
        requestHarian,
        requestBulanan
      };
    } catch (err) {
      console.log('⚠️ Gagal ambil/update data:', err.message);
      req.statData = {
        totalRequest: 0,
        requestHarian: {},
        requestBulanan: {}
      };
    }

    next();
  });

  function countRoutes() {
    let routeCount = 0;
    app._router.stack.forEach((middleware) => {
      if (middleware.route) routeCount++;
      else if (middleware.name === 'router') {
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

  app.get('/api-status/status', (req, res) => {
    try {
      const now = new Date();
      const hari = now.toISOString().split('T')[0];
      const bulan = now.toISOString().slice(0, 7);
      const runtime = Date.now() - deployTimestamp.getTime();
      const domain = req.hostname;
      const totalfitur = countRoutes();

      const { totalRequest, requestHarian, requestBulanan } = req.statData;

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalrequestharian: requestHarian[hari]?.toString() || "0",
          totalrequestbulanan: requestBulanan[bulan]?.toString() || "0",
          totalfitur,
          runtime: formatRuntime(runtime),
          domain
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
