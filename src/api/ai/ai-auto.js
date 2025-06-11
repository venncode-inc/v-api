const axios = require('axios');

module.exports = function(app) {
  async function getAnswer(q) {
    // Step 1: Coba ambil dari database.json di GitHub
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

    // Step 2: Coba dari Google Fonts API
    try {
      const fontsRes = await axios.get(`https://api.nekorinn.my.id/search/google-fonts?q=${encodeURIComponent(q)}`);
      if (fontsRes.status === 200) {
        return {
          status: true,
          creator: "Hazel",
          source: "Google Fonts API",
          result: fontsRes.data.result || fontsRes.data.message
        };
      }
    } catch (e) {
      if (e.response?.status !== 500) throw e;
    }

    // Step 3: Coba dari Google Search API
    try {
      const googleRes = await axios.get(`https://api.nekorinn.my.id/search/google?q=${encodeURIComponent(q)}`);
      if (googleRes.status === 200) {
        return {
          status: true,
          creator: "Hazel",
          source: "Google Search API",
          result: googleRes.data.result || googleRes.data.message
        };
      }
    } catch (e) {
      if (e.response?.status !== 500) throw e;
    }

    // Step 4: Terakhir, gunakan Gemini AI
    try {
      const geminiRes = await axios.get(`https://api.nekorinn.my.id/ai/gemini?text=${encodeURIComponent(q)}`);
      if (geminiRes.status === 200) {
        return {
          status: true,
          creator: "Hazel",
          source: "Gemini AI",
          result: geminiRes.data.result || geminiRes.data.message
        };
      }
    } catch (e) {
      throw new Error("Gagal mendapatkan respons dari semua sumber.");
    }
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
