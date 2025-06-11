const axios = require("axios");

module.exports = function (app) {
    app.get('/search/spotify', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.json({ status: false, error: 'Query is required' });
            }

            const apiUrl = `https://nirkyy-dev.hf.space/api/v1/spotify-search-track?query=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data.result) {
                return res.json({ status: false, error: 'No data found', creator: "Hazel" });
            }

            res.json({
                status: true,
                creator: "Hazel",
                result: response.data.result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message, creator: "Hazel" });
        }
    });
};
