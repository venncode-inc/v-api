const axios = require('axios');

module.exports = function(app) {
  async function getAnswer(q) {
    // Step 1: Gemini AI dulu
    try {
      const geminiRes = await axios.get(`https://api.nekorinn.my.id/ai/gemini?text=${encodeURIComponent(q)}`);
      if (geminiRes.status === 200 && geminiRes.data.result) {
        return {
          status: true,
          creator: "Hazel",
          source: "Gemini AI",
          result: geminiRes.data.result
        };
      }
    } catch (e) {
      console.warn("Gagal dari Gemini AI:", e.message);
    }

    // Step 2: Cek dari database.json GitHub
    try {
      const dbRes = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/database.json');
      const database = dbRes.data;
      const matched = database.find(item => item.question?.toLowerCase() === q.toLowerCase());

      if (matched) {
        return {
          status: true,
          creator: "Hazel",
          source: "GitHub Database",
          result: matched.answer
        };
      }
    } catch (e) {
      console.warn("Gagal ambil database.json:", e.message);
    }

    // Step 3: Cek Google Search (top 5)
    try {
      const googleRes = await axios.get(`https://api.nekorinn.my.id/search/google?q=${encodeURIComponent(q)}`);
      if (googleRes.status === 200 && Array.isArray(googleRes.data.result)) {
        const top5 = googleRes.data.result.slice(0, 5);
        return {
          status: true,
          creator: "Hazel",
          source: "Google Search API",
          result: top5
        };
      }
    } catch (e) {
      if (e.response?.status !== 500) throw e;
    }

    // Step 4: Cek Google Fonts (top 5)
    try {
      const fontsRes = await axios.get(`https://api.nekorinn.my.id/search/google-fonts?q=${encodeURIComponent(q)}`);
      if (fontsRes.status === 200 && Array.isArray(fontsRes.data.result)) {
        const top5Fonts = fontsRes.data.result.slice(0, 5);
        return {
          status: true,
          creator: "Hazel",
          source: "Google Fonts API",
          result: top5Fonts
        };
      }
    } catch (e) {
      if (e.response?.status !== 500) throw e;
    }

    // Step terakhir: Semua gagal
    throw new Error("Gagal mendapatkan respons dari semua sumber.");
  }

  app.get('/ai/auto', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          status: false,
          creator: "Hazel",
          source: null,
          result: 'Parameter "q" diperlukan'
        });
      }

      const result = await getAnswer(q);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        creator: "Hazel",
        source: null,
        result: "Maaf, terjadi kesalahan saat memproses permintaan Anda."
      });
    }
  });
};
