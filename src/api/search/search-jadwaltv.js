const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  app.get('/search/jadwaltv', async (req, res) => {
    const { channel } = req.query;
    if (!channel) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan nama channel, contoh: /search/jadwaltv?channel=RCTI'
      });
    }

    try {
      // URL target scrapping
      const url = `https://www.jadwaltv.net/channel/${channel.toLowerCase()}`;

      const response = await axios.get(url);
      const html = response.data;

      const $ = cheerio.load(html);

      // Parsing jadwal acara, sesuaikan selector dengan struktur html target
      const jadwal = [];
      
      // Contoh struktur:
      // <div class="tv-list">
      //   <div class="tv-list-item">
      //     <span class="tv-list-time">07:00</span>
      //     <span class="tv-list-title">Berita</span>
      //   </div>
      // </div>
      
      $('.tv-list .tv-list-item').each((i, el) => {
        const time = $(el).find('.tv-list-time').text().trim();
        const title = $(el).find('.tv-list-title').text().trim();

        if (time && title) {
          jadwal.push({ time, title });
        }
      });

      if (jadwal.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'Jadwal tidak ditemukan atau format halaman berubah.'
        });
      }

      res.json({
        status: true,
        channel: channel.toUpperCase(),
        jadwal
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data jadwal TV.',
        error: error.message
      });
    }
  });
};
