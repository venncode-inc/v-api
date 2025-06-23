const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/arting', async (req, res) => {
    const { text, apikey } = req.query;

    if (!text || !apikey) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" dan "apikey" wajib diisi. Contoh: /imagecreator/arting?text=cewek anime&apikey=ISI_API_KEY'
      });
    }

    try {
      const response = await axios.get('https://velyn.biz.id/api/ai/arting', {
        params: {
          prompt: text,
          apikey: apikey
        },
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil gambar dari API eksternal',
        error: err.message
      });
    }
  });
};
