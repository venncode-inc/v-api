const axios = require('axios');

module.exports = function (app) {
    const SOURCES = [
        { name: 'neural', url: 'https://api.nekorinn.my.id/ai/neural-chat?text=' },
        { name: 'openai', url: 'https://api.nekorinn.my.id/ai/openai?text=' },
        { name: 'gemini', url: 'https://api.nekorinn.my.id/ai/gemini?text=' },
        { name: 'ai4chat', url: 'https://api.nekorinn.my.id/ai/ai4chat?text=' },
        { name: 'google', url: 'https://api.nekorinn.my.id/search/google?q=' }
    ];

    async function quantumFastAI(text) {
        if (!text) throw new Error('Teks tidak boleh kosong');

        const startTime = Date.now();

        const requests = SOURCES.map(source =>
            axios.get(source.url + encodeURIComponent(text), {
                timeout: 7000,
                headers: { 'User-Agent': 'QuantumAI/1.0 (Hazelnut)' }
            }).then(response => ({
                name: source.name,
                result: response.data.result || response.data.message || response.data.results?.[0]?.title || 'no result',
                speed: Date.now() - startTime
            }))
        );

        try {
            const fastest = await Promise.race(requests);
            return {
                status: true,
                source: fastest.name,
                result: fastest.result,
                speed_ms: fastest.speed
            };
        } catch {
            return {
                status: false,
                error: 'Semua AI gagal merespons 😭'
            };
        }
    }

    app.get('/ai/quantum', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({
                    status: false,
                    error: 'Parameter ?text= wajib diisi.'
                });
            }

            const result = await quantumFastAI(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                source: result.source,
                speed_ms: result.speed_ms,
                result: result.result
            });
        } catch {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                result: "Semua AI gagal memberikan jawaban 🥲"
            });
        }
    });
};
