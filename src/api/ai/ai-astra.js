const axios = require('axios');

module.exports = function (app) {
    // Sumber AI eksternal
    const SOURCES = [        
        { name: 'luminai', url: 'https://zelapioffciall.vercel.app/ai/luminai', param: 'text' }
    ];

    // Fungsi untuk cek respons dari database lokal (JSON)
    async function checkLocalDatabase(text) {
        try {
            const [resAstraAI, resDatabase] = await Promise.all([
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/local.json'),
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/database.json')
            ]);

            const combinedData = [...resAstraAI.data, ...resDatabase.data];
            const lowerText = text.toLowerCase();

            for (const item of combinedData) {
                const matched = item.patterns.some(pattern => lowerText.includes(pattern.toLowerCase()));
                if (matched) {
                    const responses = item.responses;
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    return randomResponse;
                }
            }

            return null;
        } catch (err) {
            console.error('Gagal mengambil data lokal:', err.message);
            return null;
        }
    }

    // Fungsi untuk fallback ke AI eksternal jika tidak ada di database
    async function useAstraAI(text) {
        const shuffled = [...SOURCES].sort(() => Math.random() - 0.5);
        const start = Date.now();

        for (const source of shuffled) {
            try {
                const params = new URLSearchParams();
                params.append(source.param || 'text', text);

                const response = await axios.get(`${source.url}?${params.toString()}`, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'AstraAI/1.0 (Hazel)'
                    }
                });

                return {
                    status: true,
                    result: response.data?.result || response.data?.message || 'Model tidak memberikan hasil',
                    speed_ms: Date.now() - start
                };
            } catch (error) {
                console.warn(`Gagal pakai ${source.name}, mencoba sumber lain...`);
                continue;
            }
        }

        return {
            status: false,
            result: 'Semua sumber gagal merespons 😔'
        };
    }

    // Endpoint utama
    app.get('/ai/astraai', async (req, res) => {
        const text = (req.query.text || '').trim();

        if (!text) {
            return res.status(400).json({
                status: false,
                error: 'Parameter ?text= wajib diisi yaa sayangg 💔'
            });
        }

        try {
            // Langkah 1: Coba cari di database lokal
            const localResult = await checkLocalDatabase(text);
            if (localResult) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "Database Lokal",
                    result: localResult
                });
            }

            // Langkah 2: Jika tidak ditemukan, pakai AI eksternal
            const aiResult = await useAstraAI(text);
            return res.status(aiResult.status ? 200 : 500).json({
                status: aiResult.status,
                creator: "Hazel",
                source: "Astra AI",
                result: aiResult.result
            });

        } catch (err) {
            return res.status(500).json({
                status: false,
                creator: "Hazel",
                source: "Astra AI",
                result: 'Terjadi kesalahan tak terduga 😵'
            });
        }
    });
};
