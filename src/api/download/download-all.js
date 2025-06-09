const axios = require('axios');

module.exports = function (app) {
  app.get('/download/all', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.json({
        status: false,
        message: 'Parameter ?url= diperlukan. Contoh: ?url=https://www.tiktok.com/xxxxx'
      });
    }

    try {
      const apiURL = 'https://r-nozawa.hf.space/aio';

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
        message: 'Gagal mengambil data dari r-nozawa.hf.space',
        error: e.message
      });
    }
  });
};
