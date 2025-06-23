const axios = require('axios');

module.exports = function (app) {
  app.get('/download/threads', async (req, res) => {
    const { url } = req.query;

    // Validasi URL Threads
    if (!url || !/^https:\/\/(www\.)?threads\.net\//.test(url)) {
      return res.status(400).json({
        status: false,
        message: 'Gunakan link Threads yang valid. Contoh: ?url=https://www.threads.net/xxxxx'
      });
    }

    try {
      const apiURL = 'https://velyn.biz.id/api/downloader/threads';
      const response = await axios.get(apiURL, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const data = response.data;

      res.json({
        ...data,
        creator: 'Hazel'
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari API velyn.biz.id',
        error: err.message
      });
    }
  });
};
