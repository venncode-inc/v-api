const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/ssweb', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter "url" wajib diisi. Contoh: /tools/ssweb?url=https://example.com'
      });
    }

    try {
      // API langsung hasilin gambar PNG
      const apiUrl = `https://velyn.biz.id/api/tools/ssweb?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer' // karena hasilnya gambar
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'Hazel',
        message: 'Gagal mengambil screenshot',
        error: err.message
      });
    }
  });
};
