const axios = require('axios');

module.exports = function(app) {
    const rateLimit = {};
    const LIMIT = 5; // 5 request
    const WINDOW = 60 * 60 * 1000; // 1 jam (dalam ms)

    function isRateLimited(ip) {
        const now = Date.now();
        if (!rateLimit[ip]) {
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        const { count, start } = rateLimit[ip];

        if (now - start > WINDOW) {
            // Reset jika sudah lewat 1 jam
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        if (count >= LIMIT) {
            return true;
        }

        rateLimit[ip].count++;
        return false;
    }

    async function rule34() {
        const { data } = await axios.get(`https://api.nekorinn.my.id/random/rule34`);
        const imageUrl = data[Math.floor(Math.random() * data.length)];
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    app.get('/random/rule34', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;

        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                error: 'Rate limit exceeded. Maksimal 5 request per jam.',
            });
        }

        try {
            const buffer = await rule34();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
