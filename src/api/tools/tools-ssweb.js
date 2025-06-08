const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/ssweb', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter "url" wajib diisi. Contoh: /imagecreator/ssweb?url=https://example.com'
      });
    }

    try {
      // pakai layanan screenshot gratis (thum.io)
      const screenshotUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`;

      // ambil data sebagai gambar (arraybuffer)
      const response = await axios.get(screenshotUrl, {
        responseType: 'arraybuffer'
      });

      // kasih header image/png
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
