const axios = require('axios');

module.exports = function(app) {
    async function fetchAICustom(prompt, system, apikey) {
        try {
            const url = `https://velyn.biz.id/api/ai/aicustom?prompt=${encodeURIComponent(prompt)}&system=${encodeURIComponent(system)}&apikey=${encodeURIComponent(apikey)}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from AICustom API:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke API AICustom.");
        }
    }

    app.post('/ai/aicustom', async (req, res) => {
        try {
            const { prompt, system, apikey } = req.body;

            if (!prompt || !apikey || !system) {
                return res.status(400).json({
                    status: false,
                    error: 'Parameter "prompt", "system", dan "apikey" wajib diisi.'
                });
            }

            const result = await fetchAICustom(prompt, system, apikey);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada respons dari AI 🥺"
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
