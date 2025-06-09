const axios = require('axios');

const deployTimestamp = new Date('2025-06-05T03:00:00Z');
const jsonBlobUrl = 'https://jsonblob.com/api/jsonBlob/1381662714862166016';

let statData = {
  totalRequest: 0,
};

// load data dari JSONBlob saat server start
async function loadStatData() {
  try {
    const res = await axios.get(jsonBlobUrl);
    if (res.data) {
      statData = res.data;
      console.log('StatData berhasil di-load dari JSONBlob');
    }
  } catch (err) {
    console.log('Gagal load data dari JSONBlob, pakai data default');
  }
}

// update data ke JSONBlob
async function updateJsonBlob(data) {
  try {
    await axios.put(jsonBlobUrl, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('StatData berhasil di-update ke JSONBlob');
  } catch (err) {
    console.error('Gagal update JSONBlob:', err.message);
  }
}

module.exports = function (app) {
  loadStatData();

  // middleware update totalRequest tiap request
  app.use((req, res, next) => {
    statData.totalRequest++;
    req.statData = statData;
    next();
  });

  // hitung jumlah route
  function countRoutes() {
    let routeCount = 0;
    app._router.stack.forEach(middleware => {
      if (middleware.route) routeCount++;
      else if (middleware.name === 'router') {
        middleware.handle.stack.forEach(handler => {
          if (handler.route) routeCount++;
        });
      }
    });
    return routeCount;
  }

  // format waktu runtime
  function formatRuntime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}j ${mins}m ${secs}d`;
  }

  // endpoint status, update JSONBlob setelah respon
  app.get('/api-status/status', async (req, res) => {
    try {
      const runtime = Date.now() - deployTimestamp.getTime();
      const domain = req.hostname;
      const totalfitur = countRoutes();

      const { totalRequest } = req.statData;

      const result = {
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalfitur: totalfitur,
          runtime: formatRuntime(runtime),
          domain: domain
        }
      };

      res.json(result);

      await updateJsonBlob(statData);
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil status',
        error: e.message
      });
    }
  });
};
