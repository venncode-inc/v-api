const axios = require('axios');
const cheerio = require('cheerio');

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile Safari/604.1",
  "Mozilla/5.0 (Linux; Android 11; Redmi Note 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; SM-A107F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; V2149) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.68 Mobile Safari/537.36", "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-T976B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/111.0.0.0 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Linux; Android 9; Mi A1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 8.1.0; CPH1803) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.70 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
];

// Fungsi untuk ambil User-Agent random
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

module.exports = function (app) {
  app.get('/search/cookpad', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query is required, contoh: ?q=ayam goreng' });
    }

    try {
      const encoded = encodeURIComponent(q);
      const url = `https://cookpad.com/id/cari/${encoded}`;
      const headers = {
        'User-Agent': getRandomUserAgent()
      };

      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);

      const results = [];

      $('div#main_content article.recipe').each((i, el) => {
        const title = $(el).find('a').text().trim();
        const link = 'https://cookpad.com' + $(el).find('a').attr('href');
        const img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        if (title && link) {
          results.push({ title, link, thumbnail: img });
        }
      });

      if (!results.length) {
        return res.json({ status: false, message: 'Tidak ditemukan' });
      }

      res.json({ status: true, result: results });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data', error: e.message });
    }
  });
};