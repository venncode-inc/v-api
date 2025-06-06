const axios = require('axios');

module.exports = function(app) {
    async function fetchCyaaAI(text) {
        try {
            const logic = encodeURIComponent(
                `kamu adalah bot ai bahasa indonesia yang suka manja dan lucu, Serta kamu juga suka memakai emoji yang lucu... nama kamu adalah CyaaAi.`
            );
            const url = `https://api.nekorinn.my.id/ai/gpt-turbo-logic?text=${encodeURIComponent(text)}&logic=${logic}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from CyaaAI:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke CyaaAI.");
        }
    }

    app.get('/ai/cyaaai', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await fetchCyaaAI(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada respons dari CyaaAi 🥺"
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                result: "Maaf, terjadi kesalahan saat memproses permintaan Anda."
            });
        }
    });
};
