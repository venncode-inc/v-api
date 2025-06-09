const axios = require('axios');

module.exports = function (app) {
  app.get('/download/threads', async (req, res) => {
    const { url } = req.query;

    if (!url || !url.startsWith('https://www.threads.net/')) {
      return res.json({
        status: false,
        message: 'Gunakan link dari Threads. Contoh: ?url=https://www.threads.net/xxxxx'
      });
    }

    try {
      const apiURL = 'https://www.velyn.biz.id/api/downloader/threads';

      const { data } = await axios.get(apiURL, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const modified = {
        ...data,
        creator: 'Hazel'
      };

      res.json(modified);
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari velyn.biz.id',
        error: e.message
      });
    }
  });
};
