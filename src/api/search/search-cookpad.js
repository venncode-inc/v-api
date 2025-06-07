const axios = require('axios');

module.exports = function (app) {
  app.get('/search/cookpad', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query is required, contoh: ?q=ayam goreng' });
    }

    try {
      const encoded = encodeURIComponent(q);
      const url = `https://zenz.biz.id/search/cookpad?q=${encoded}`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.result || !data.result.length) {
        return res.json({ status: false, message: 'Tidak ditemukan' });
      }

      res.json({
        status: true,
        result: data.result
      });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data dari API', error: e.message });
    }
  });
};
