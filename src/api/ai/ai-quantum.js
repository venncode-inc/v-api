const axios = require('axios');

module.exports = function (app) {
    const SOURCES = [
        { name: 'neural', url: 'https://api.nekorinn.my.id/ai/neural-chat', param: 'text' },
        { name: 'aimath', url: 'https://api.nekorinn.my.id/ai/aimath', param: 'text' },
        { name: 'zephyr', url: 'https://api.nekorinn.my.id/ai/zephyr', param: 'text' },
        { name: 'openai', url: 'https://api.nekorinn.my.id/ai/openai', param: 'text' },
        { name: 'gemini', url: 'https://api.nekorinn.my.id/ai/gemini', param: 'text' },
        { name: 'ai4chat', url: 'https://api.nekorinn.my.id/ai/ai4chat', param: 'text' },
        { name: 'gptturbo', url: 'https://zelapioffciall.vercel.app/ai/gpt-turbo', param: 'text' },
        { name: 'gita', url: 'https://api.siputzx.my.id/api/ai/gita', param: 'q' },
        { name: 'image2text', url: 'https://api.siputzx.my.id/api/ai/image2text', param: 'url' },
        { name: 'venice', url: 'https://api.siputzx.my.id/api/ai/venice', param: 'prompt' },
        { name: 'lilyai', url: 'https://velyn.biz.id/api/ai/LilyAI', param: 'prompt' },
        { name: 'google', url: 'https://velyn.biz.id/api/ai/google', param: 'prompt' },
        { name: 'metaai', url: 'https://api.siputzx.my.id/api/ai/metaai', param: 'query' },
        { name: 'bard', url: 'https://api.siputzx.my.id/api/ai/bard-thinking', param: 'query' },
        { name: 'luminai', url: 'https://zelapioffciall.vercel.app/ai/luminai', param: 'text' }
    ];

    const GEOJSON_SOURCES = [
        {
            name: "kabupaten_indonesia",
            url: "https://raw.githubusercontent.com/ardian28/GeoJson-Indonesia-38-Provinsi/refs/heads/main/Kabupaten/38%20Provinsi%20Indonesia%20-%20Kabupaten.json"
        },
        {
            name: "provinsi_aceh",
            url: "https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/refs/heads/master/data/geojson/province/11.geojson"
        },
        {
          name: "provinsi_bali",
          url: "https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/refs/heads/master/data/geojson/province/31.geojson"
    ];

    async function checkDatabase(text) {
        try {
            const res = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/quantumdatabase.json');
            const data = res.data;

            for (const item of data) {
                const patterns = item.patterns.map(p => p.toLowerCase());
                for (const pattern of patterns) {
                    if (text.toLowerCase().includes(pattern)) {
                        const responses = item.responses;
                        return responses[Math.floor(Math.random() * responses.length)];
                    }
                }
            }

            return null;
        } catch (err) {
            console.error('Gagal mengambil database lokal:', err.message);
            return null;
        }
    }

    async function checkGeoJSON(text) {
        const keyword = text.toLowerCase();

        for (const source of GEOJSON_SOURCES) {
            try {
                const res = await axios.get(source.url);
                const features = res.data.features;

                for (const item of features) {
                    const name = (item.properties?.nama || item.properties?.NAME_2 || item.properties?.name || '').toLowerCase();

                    if (name.includes(keyword)) {
                        return `📍 Ditemukan: ${item.properties.nama || item.properties.NAME_2 || item.properties.name}`;
                    }
                }
            } catch (err) {
                console.warn(`Gagal mengambil data dari ${source.name}:`, err.message);
                continue;
            }
        }

        return null;
    }

    async function quantumRandomAI(userText) {
        // ... fungsi AI seperti biasa ...
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
            const localResponse = await checkDatabase(text);
            if (localResponse) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "Quantum AI",
                    speed_ms: 0,
                    result: localResponse
                });
            }

            const geoResponse = await checkGeoJSON(text);
            if (geoResponse) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "GeoJSON AI",
                    speed_ms: 0,
                    result: geoResponse
                });
            }

            const result = await quantumRandomAI(text);
            return res.status(result.status ? 200 : 500).json({
                status: result.status,
                creator: "Hazel",
                source: "Quantum AI",
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
