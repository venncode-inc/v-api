const axios = require('axios');

module.exports = function (app) {
  app.get('/search/cookpad', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query is required, contoh: ?q=ayam goreng' });
    }

    try {
      const apiURL = `https://zenz.biz.id/search/cookpad?q=${encodeURIComponent(q)}`;
      const { data } = await axios.get(apiURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      // Output langsung dari API zenz.biz.id TANPA DIUBAH
      res.json(data);
    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data dari zenz.biz.id', error: e.message });
    }
  });
};
