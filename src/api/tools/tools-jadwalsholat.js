const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/jadwalsholat', async (req, res) => {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan nama kota, contoh: /tools/jadwalsholat?city=bandung'
      });
    }

    try {
      const apiUrl = `https://nirkyy-dev.hf.space/api/v1/jadwal-sholat?city=${encodeURIComponent(city)}`;
      const response = await axios.get(apiUrl);

      const data = response.data;

      if (!data || !data.jadwal) {
        return res.status(404).json({ status: false, message: 'Data jadwal tidak ditemukan untuk city tersebut.' });
      }

      res.json({
        status: true,
        city: data.city || city,
        tanggal: data.tanggal || new Date().toISOString().split('T')[0],
        jadwal: {
          imsak: data.jadwal.imsak,
          subuh: data.jadwal.subuh,
          dzuhur: data.jadwal.dzuhur,
          ashar: data.jadwal.ashar,
          maghrib: data.jadwal.maghrib,
          isya: data.jadwal.isya
        }
      });

    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari API eksternal',
        error: e.message
      });
    }
  });
};
