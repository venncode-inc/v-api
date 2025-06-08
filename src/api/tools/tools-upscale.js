const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/hdin', async (req, res) => {
    const { image_url, apikey } = req.query;

    // Validasi apikey
    if (!apikey || !global.apikey.includes(apikey)) {
      return res.status(403).json({
        status: false,
        creator: 'Hazel',
        error: 'Apikey invalid'
      });
    }

    // Validasi image_url
    if (!image_url) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter "image_url" wajib diisi. Contoh: /imagecreator/hdin?image_url=https://example.com/foto.jpg&apikey=xxx'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/pxpic-upscale?imageUrl=${encodeURIComponent(image_url)}`;
      const response = await axios.get(apiUrl);

      // Gabungkan hasil dari API NekoRinn dengan creator
      const result = {
        status: response.data.status,
        creator: 'Hazel',
        message: response.data.message,
        data: response.data.data
      };

      return res.json(result);

    } catch (err) {
      return res.status(500).json({
        status: false,
        creator: 'Hazel',
        message: 'Gagal Menghubungi Server',
        error: err.message
      });
    }
  });
};
