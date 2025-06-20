const axios = require('axios');

module.exports = function (app) {
    const SOURCES = [
        { name: 'neural', url: 'https://api.nekorinn.my.id/ai/neural-chat?text=' },
        { name: 'openai', url: 'https://api.nekorinn.my.id/ai/openai?text=' },
        { name: 'gemini', url: 'https://api.nekorinn.my.id/ai/gemini?text=' },
        { name: 'ai4chat', url: 'https://api.nekorinn.my.id/ai/ai4chat?text=' },
        { name: 'blackbox', url: 'https://api.siputzx.my.id/api/ai/blackboxai?content=' },
        { name: 'luminai', url: 'https://api.siputzx.my.id/api/ai/luminai?content=' }
    ];

    function getRandomSource() {
        return SOURCES[Math.floor(Math.random() * SOURCES.length)];
    }

    async function quantumRandomAI(text) {
        if (!text) throw new Error('Teks tidak boleh kosong');

        const chosen = getRandomSource();
        const start = Date.now();

        try {
            const response = await axios.get(chosen.url + encodeURIComponent(text), {
                timeout: 7000,
                headers: {
                    'User-Agent': 'QuantumAI/1.0 (Hazelnut)'
                }
            });

            const result = response.data?.result || response.data?.message || 'Tidak ada hasil';
            const speed = Date.now() - start;

            return {
                status: true,
                result,
                speed_ms: speed
            };
        } catch (error) {
            return {
                status: false,
                result: 'Gagal mengambil jawaban dari Quantum AI 😢'
            };
        }
    }

    app.get('/ai/quantum', async (req, res) => {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({
                status: false,
                error: 'Parameter ?text= wajib diisi yaa sayang 💔'
            });
        }

        try {
            const result = await quantumRandomAI(text);

            if (result.status) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "Quantum AI",
                    speed_ms: result.speed_ms,
                    result: result.result
                });
            } else {
                return res.status(500).json({
                    status: false,
                    creator: "Hazel",
                    source: "Quantum AI",
                    result: result.result
                });
            }
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
