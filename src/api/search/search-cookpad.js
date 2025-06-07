const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  app.get('/search/cookpad', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query is required, contoh: ?q=ayam goreng' });
    }

    try {
      const searchURL = `https://cookpad.com/id/cari/${encodeURIComponent(q)}`;
      const { data: html } = await axios.get(searchURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const $ = cheerio.load(html);
      const results = [];

      $('div.recipe-card').each((i, el) => {
        const title = $(el).find('.recipe-title').text().trim();
        const link = 'https://cookpad.com' + $(el).find('a').attr('href');
        const thumb = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');

        results.push({ title, link, thumb });
      });

      if (!results.length) {
        return res.json({ status: false, message: 'Tidak ditemukan' });
      }

      res.json({
        status: true,
        result: results,
      });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal scraping dari Cookpad', error: e.message });
    }
  });
};
