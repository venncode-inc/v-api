const axios = require('axios');

module.exports = function (app) {
    const SOURCES = [
        { name: 'neural', url: 'https://api.nekorinn.my.id/ai/neural-chat', param: 'text' },
        { name: 'openai', url: 'https://api.nekorinn.my.id/ai/openai', param: 'text' },
        { name: 'gemini', url: 'https://api.nekorinn.my.id/ai/gemini', param: 'text' },
        { name: 'ai4chat', url: 'https://api.nekorinn.my.id/ai/ai4chat', param: 'text' },
        { name: 'gptturbo', url: 'https://zelapioffciall.vercel.app/ai/gpt-turbo', param: 'text' }, 
        { name: 'gita', url: 'https://api.siputzx.my.id/api/ai/gita', param: 'q' },
        { name: 'venice', url: 'https://api.siputzx.my.id/api/ai/venice', param: 'prompt' },
        { name: 'lilyai', url: 'https://velyn.biz.id/api/ai/LilyAI', param: 'prompt' },
        { name: 'google', url: 'https://velyn.biz.id/api/ai/google', param: 'prompt' },       
        { name: 'metaai', url: 'https://api.siputzx.my.id/api/ai/metaai', param: 'query' },
        { name: 'bard', url: 'https://api.siputzx.my.id/api/ai/bard-thinking?query=', param: 'query' },
        { name: 'luminai', url: 'https://zelapioffciall.vercel.app/ai/luminai', param: 'text' }
    ];

    function getRandomSource() {
        return SOURCES[Math.floor(Math.random() * SOURCES.length)];
    }

    async function quantumRandomAI(userText) {
        if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
            throw new Error('Teks tidak boleh kosong atau hanya spasi');
        }

        const chosen = getRandomSource();
        const start = Date.now();

        const paramName = chosen.param || 'text';
        const url = chosen.url;

        const params = new URLSearchParams();
        params.append(paramName, userText);

        try {
            const response = await axios.get(`${url}?${params.toString()}`, {
                timeout: 7000,
                headers: {
                    'User-Agent': 'QuantumAI/1.0 (Hazelnut)'
                }
            });

            const result = response.data?.result || response.data?.message || 'Tidak ada hasil dari model';
            const speed = Date.now() - start;

            return {
                status: true,
                result,
                speed_ms: speed,
                source: chosen.name
            };
        } catch (error) {
            return {
                status: false,
                result: 'Gagal mengambil jawaban dari Quantum AI 😢',
                source: chosen.name
            };
        }
    }

    app.get('/ai/quantum', async (req, res) => {
        const text = (req.query.text || '').trim();

        if (!text) {
            return res.status(400).json({
                status: false,
                error: 'Parameter ?text= wajib diisi yaa sayangg 💔'
            });
        }

        try {
            const result = await quantumRandomAI(text);

            return res.status(result.status ? 200 : 500).json({
                status: result.status,
                creator: "Hazel",
                source: result.source,
                speed_ms: result.speed_ms || null,
                result: result.result
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                creator: "Hazel",
                source: "Quantum AI",
                result: 'Terjadi kesalahan tak terduga 😵'
            });
        }
    });
};
