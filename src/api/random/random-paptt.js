const axios = require('axios');

module.exports = function(app) {
    const rateLimit = {};
    const LIMIT = 5; // max 5 request
    const WINDOW = 60 * 60 * 1000; // 1 jam

    const sistemUrl = 'https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/sistem.json';

    // 🔑 Validasi API Key dari sistem.json
    async function isValidApiKey(apiKey) {
        try {
            const { data } = await axios.get(sistemUrl);
            return data.some(entry => entry.apikey === apiKey && entry.status === "active");
        } catch (err) {
            console.error('Gagal ambil sistem.json:', err.message);
            return false;
        }
    }

    // 🧠 Rate limit berdasarkan IP
    function isRateLimited(ip) {
        const now = Date.now();
        if (!rateLimit[ip]) {
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        const { count, start } = rateLimit[ip];

        if (now - start > WINDOW) {
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        if (count >= LIMIT) return true;

        rateLimit[ip].count++;
        return false;
    }

    // 📸 Ambil gambar dari API nekorinn
    async function getCosplayImage() {
        const { data } = await axios.get('https://api.nekorinn.my.id/random/cosplay');
        const response = await axios.get(data.url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    // 🚀 Endpoint utama
    app.get('/random/paptt', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const apiKey = req.query.apikey;

        // Cek API key
        if (!apiKey) {
            return res.status(400).json({ status: false, error: 'apikey diperlukan.' });
        }

        const valid = await isValidApiKey(apiKey);
        if (!valid) {
            return res.status(403).json({ status: false, error: 'apikey tidak valid atau tidak aktif.' });
        }

        // Cek rate limit
        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                error: 'Rate limit exceeded. Maksimal 5 request per jam.',
            });
        }

        // Proses kirim gambar
        try {
            const buffer = await getCosplayImage();
            res.writeHead(200, {
                'Content-Type': 'image/jpeg', // biasanya jpg
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
