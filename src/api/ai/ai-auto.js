const axios = require('axios');

module.exports = function(app) {
  async function getAnswer(q) {
    const lowerQ = q.toLowerCase();

    // Jika mengandung kata "font" → Google Fonts API
    if (lowerQ.includes("font")) {
      try {
        const fontsRes = await axios.get(`https://api.nekorinn.my.id/search/google-fonts?q=${encodeURIComponent(q)}`);
        if (fontsRes.status === 200 && Array.isArray(fontsRes.data.result)) {
          return {
            status: true,
            creator: "Hazel",
            source: "Google Fonts API",
            result: fontsRes.data.result.slice(0, 5)
          };
        }
      } catch (e) {
        console.warn("Gagal dari Google Fonts:", e.message);
      }
    }

    // Jika mengandung "search" atau "cari" → Google Search API
    if (lowerQ.includes("search") || lowerQ.includes("cari")) {
      try {
        const googleRes = await axios.get(`https://api.nekorinn.my.id/search/google?q=${encodeURIComponent(q)}`);
        if (googleRes.status === 200 && Array.isArray(googleRes.data.result)) {
          return {
            status: true,
            creator: "Hazel",
            source: "Google Search API",
            result: googleRes.data.result.slice(0, 5)
          };
        }
      } catch (e) {
        console.warn("Gagal dari Google Search:", e.message);
      }
    }

    // Step 1: Gemini AI (default)
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
      console.warn("Gagal dari Gemini:", e.message);
    }

    // Step 2: Cek database.json di GitHub
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

    // Step 3: Google Search cadangan
    try {
      const googleRes = await axios.get(`https://api.nekorinn.my.id/search/google?q=${encodeURIComponent(q)}`);
      if (googleRes.status === 200 && Array.isArray(googleRes.data.result)) {
        return {
          status: true,
          creator: "Hazel",
          source: "Google Search API",
          result: googleRes.data.result.slice(0, 5)
        };
      }
    } catch (e) {
      console.warn("Gagal dari Google Search (fallback):", e.message);
    }

    // Step 4: Google Fonts cadangan
    try {
      const fontsRes = await axios.get(`https://api.nekorinn.my.id/search/google-fonts?q=${encodeURIComponent(q)}`);
      if (fontsRes.status === 200 && Array.isArray(fontsRes.data.result)) {
        return {
          status: true,
          creator: "Hazel",
          source: "Google Fonts API",
          result: fontsRes.data.result.slice(0, 5)
        };
      }
    } catch (e) {
      console.warn("Gagal dari Google Fonts (fallback):", e.message);
    }

    // Gagal semua
    return {
      status: false,
      creator: "Hazel",
      source: null,
      result: "Maaf, tidak bisa menemukan jawaban untuk pertanyaan tersebut."
    };
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
