const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/jadwaltv', async (req, res) => {
    const { channel } = req.query;
    if (!channel) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan nama channel, contoh: /tools/jadwaltv?channel=RCTI'
      });
    }

    try {
      const { data } = await axios.get(`https://api.siputzx.my.id/api/info/jadwaltv?channel=${encodeURIComponent(channel)}`);

      if (!data || !data.result) {
        return res.status(404).json({
          status: false,
          message: 'Channel tidak ditemukan atau tidak tersedia.'
        });
      }

      res.json({
        status: true,
        channel: channel.toUpperCase(),
        jadwal: data.result
      });

    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data jadwal TV.'
      });
    }
  });
};