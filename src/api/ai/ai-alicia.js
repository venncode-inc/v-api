const axios = require('axios');

module.exports = function(app) {
    async function fetchAliciaAI(user, msg) {
        try {
            const prompt = `kamu adalah ai yang bernama alicia dan kamu adalah ai muslim yang pintar dan cerdas serta lucu. ${user} berkata: ${msg}`;
            const url = `https://velyn.biz.id/api/ai/velyn-1.0-1b?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from Alicia AI:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke Alicia AI.");
        }
    }

    app.get('/ai/alicia', async (req, res) => {
        const { user = "Hazel", text } = req.query;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                status: false,
                error: 'Parameter "text" wajib diisi.'
            });
        }

        try {
            const result = await fetchAliciaAI(user, text);
            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || "Tidak ada respons dari Alicia AI 🥺"
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
