const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/hdin', async (req, res) => {
    const { image_url } = req.query;

    // Validasi image_url
    if (!image_url) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter \"image_url\" wajib diisi. Contoh: /imagecreator/hdin?image_url=https://example.com/foto.jpg'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/pxpic-upscale?imageUrl=${encodeURIComponent(image_url)}`;
      const response = await axios.get(apiUrl);

      // Ambil URL hasil upscale jika tersedia
      const imageResult = response.data?.data?.url || null;

      return res.json({
        status: response.data.status,
        creator: 'Hazel',
        message: response.data.message,
        url: imageResult
      });

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
