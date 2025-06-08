const axios = require('axios');

const ENDPOINT_URL = 'https://api.npoint.io/bf65c11b534bde0e3ad4'; // ganti sama punyamu
const deployTimestamp = new Date('2025-06-05T03:00:00Z');

module.exports = function (app) {
  app.use(async (req, res, next) => {
    try {
      // ambil data terkini dari npoint
      const { data } = await axios.get(ENDPOINT_URL);

      const now = new Date();
      const hari = now.toISOString().split('T')[0];
      const bulan = now.toISOString().slice(0, 7);

      // update data di variabel
      const totalRequest = (data.totalRequest || 0) + 1;
      const requestHarian = data.requestHarian || {};
      const requestBulanan = data.requestBulanan || {};

      requestHarian[hari] = (requestHarian[hari] || 0) + 1;
      requestBulanan[bulan] = (requestBulanan[bulan] || 0) + 1;

      // update balik ke npoint
      await axios.put(ENDPOINT_URL, {
        totalRequest,
        requestHarian,
        requestBulanan
      });

      // simpan ke req biar bisa dipakai di route
      req.statData = {
        totalRequest,
        requestHarian,
        requestBulanan
      };

    } catch (err) {
      console.log('⚠️ Gagal ambil/update npoint:', err.message);
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
