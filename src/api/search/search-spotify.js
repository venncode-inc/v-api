const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
    app.get('/search/spotify', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.json({ status: false, error: 'Query is required' });
            }

            const url = `https://open.spotify.com/search/${encodeURIComponent(q)}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const $ = cheerio.load(response.data);
            const scripts = $('script');

            let rawJson = '';
            scripts.each((i, el) => {
                const content = $(el).html();
                if (content.includes('Spotify.Entity')) {
                    rawJson = content;
                }
            });

            const jsonMatch = rawJson.match(/Spotify\.Entity\s*=\s*(\{.+\});/);
            if (!jsonMatch) return res.json({ status: false, error: 'No data found' });

            const data = JSON.parse(jsonMatch[1]);
            const tracks = data.tracks?.items?.map(track => ({
                title: track.name,
                artists: track.artists.map(a => a.name).join(', '),
                album: track.album.name,
                url: `https://open.spotify.com/track/${track.id}`,
                cover: track.album.images[0]?.url
            })) || [];

            res.json({ status: true, result: tracks });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
