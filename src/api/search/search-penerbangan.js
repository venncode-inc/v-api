const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  app.get('/track/flight', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query kode penerbangan diperlukan, contoh: ?q=SV5276' });
    }

    try {
      const url = `https://flightaware.com/live/flight/${encodeURIComponent(q)}`;
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      const $ = cheerio.load(html);
      const flightTitle = $('h1 span.pageTitle').first().text().trim();
      const summary = $('div.flightPageSummary').text().trim().replace(/\s+/g, ' ');
      const origin = $('div.airportCodeFrom span').text().trim();
      const destination = $('div.airportCodeTo span').text().trim();
      const status = $('div.flightPageSummary div strong:contains("Status")').next().text().trim();

      res.json({
        status: true,
        creator: 'Hazel',
        flight: q.toUpperCase(),
        title: flightTitle,
        summary,
        route: `${origin} → ${destination}`,
        flight_status: status || 'Unknown / Not Found'
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari FlightAware',
        error: e.message
      });
    }
  });
};
