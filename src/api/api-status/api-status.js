const axios = require('axios');

let totalRequest = 0;
const startTime = Date.now(); // waktu saat server mulai

module.exports = function (app) {
  // Middleware buat ngitung total request
  app.use((req, res, next) => {
    totalRequest++;
    next();
  });

  // Hitung total fitur dari route yang terdaftar
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

  // Konversi runtime ke format waktu
  function formatRuntime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}j ${mins}m ${secs}d`;
  }

  // Endpoint /status
  app.get('api-status/status', async (req, res) => {
    try {
      // (opsional) contoh axios call ke luar buat test API
      // await axios.get('https://zenz.biz.id'); 

      const runtime = Date.now() - startTime;
      const domain = req.hostname;
      const totalfitur = countRoutes();

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
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
