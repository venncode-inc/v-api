const axios = require("axios");

module.exports = function (app) {
    app.get('/search/spotify', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.json({
                    status: false,
                    creator: "Hazel",
                    error: "Query is required"
                });
            }

            const apiUrl = `https://api.nekorinn.my.id/search/spotify?q=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl);

            const results = response.data?.data;

            if (!results || results.length === 0) {
                return res.json({
                    status: false,
                    creator: "Hazel",
                    error: "No data found"
                });
            }

            res.json({
                status: true,
                creator: "Hazel",
                result: results
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                error: error.message
            });
        }
    });
};
