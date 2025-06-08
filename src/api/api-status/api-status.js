const axios = require('axios');

const deployTimestamp = new Date('2025-06-05T03:00:00Z');

// Statistik global disimpan di RAM
const statData = {
  totalRequest: 0,
  requestHarian: {},  // { "2025-06-08": 123 }
  requestBulanan: {}, // { "2025-06": 4567 }
};

module.exports = function (app) {
  // Middleware untuk update statistik tiap request
  app.use((req, res, next) => {
    const now = new Date();
    const hari = now.toISOString().split('T')[0];  // ex: "2025-06-08"
    const bulan = now.toISOString().slice(0, 7);   // ex: "2025-06"

    // Update total request global
    statData.totalRequest++;

    // Update request harian global
    statData.requestHarian[hari] = (statData.requestHarian[hari] || 0) + 1;

    // Update request bulanan global
    statData.requestBulanan[bulan] = (statData.requestBulanan[bulan] || 0) + 1;

    // Simpan ke req biar bisa dipakai route
    req.statData = statData;

    next();
  });

  // Fungsi untuk hitung jumlah route di app
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

  // Fungsi format waktu runtime
  function formatRuntime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}j ${mins}m ${secs}d`;
  }

  // Endpoint status
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
