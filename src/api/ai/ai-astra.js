const axios = require('axios');

module.exports = function (app) {
    const AI_SOURCE = {
        name: 'luminai',
        url: 'https://zelapioffciall.vercel.app/ai/luminai?text={logic}'
    };

    const DEFAULT_PROMPT = (userText) => `
Kamu adalah Astra AI, asisten virtual pintar yang dibuat oleh Hazel.
Jawabanmu harus sopan, detail, dan fokus pada isi pertanyaan.
Berikut pertanyaan dari user:
${userText}
`.trim();

    async function checkDatabase(text) {
        try {
            const [resAstraAI, resDatabase] = await Promise.all([
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/local.json'),
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/AstraAi.json')
            ]);

            const data = [...resAstraAI.data, ...resDatabase.data];
            const lowerText = text.toLowerCase();

            for (const item of data) {
                const patterns = (item.patterns || []).map(p => p.toLowerCase());
                for (const pattern of patterns) {
                    if (lowerText.includes(pattern)) {
                        const responses = item.responses || [];
                        if (responses.length > 0) {
                            return responses[Math.floor(Math.random() * responses.length)];
                        }
                    }
                }
            }

            return null;
        } catch (err) {
            console.error('Gagal mengambil database lokal:', err.message);
            return null;
        }
    }

    async function callAstraAI(userText) {
        if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
            throw new Error('Teks tidak boleh kosong atau hanya spasi');
        }

        const prompt = DEFAULT_PROMPT(userText);
        const finalUrl = AI_SOURCE.url.replace('{logic}', encodeURIComponent(prompt));
        const start = Date.now();

        try {
            const response = await axios.get(finalUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'AstraAI/1.0 (Hazel)'
                }
            });

            const result = response.data?.result || response.data?.message || JSON.stringify(response.data);
            const speed = Date.now() - start;

            return {
                status: true,
                result,
                speed_ms: speed
            };
        } catch (error) {
            console.warn(`Gagal menggunakan ${AI_SOURCE.name}: ${error.message}`);
            return {
                status: false,
                result: `AI gagal merespons: ${error.message}`
            };
        }
    }

    app.get('/ai/astraai', async (req, res) => {
        const text = (req.query.text || '').trim();

        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "Hazel",
                source: "Astra AI",
                result: 'Parameter ?text= wajib diisi yaa sayangg 💔'
            });
        }

        try {
            const localResponse = await checkDatabase(text);
            if (localResponse) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "Astra AI (Database)",
                    result: localResponse
                });
            }

            const result = await callAstraAI(text);
            return res.status(result.status ? 200 : 500).json({
                status: result.status,
                creator: "Hazel",
                source: "Astra AI (Prompt)",
                result: result.result
            });
        } catch (err) {
            console.error('Internal Error:', err);
            return res.status(500).json({
                status: false,
                creator: "Hazel",
                source: "Astra AI",
                result: 'Terjadi kesalahan tak terduga 😵'
            });
        }
    });
};
