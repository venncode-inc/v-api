const axios = require('axios');

module.exports = function(app) {
    const rateLimit = {};
    const LIMIT = 5; // 5 request
    const WINDOW = 60 * 60 * 1000; // 1 jam

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

    async function paptt() {
        const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/paptt.json');
        const randomUrl = data[Math.floor(Math.random() * data.length)];
        const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    app.get('/random/paptt', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;

        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                error: 'Rate limit exceeded. Maksimal 5 request per jam.',
            });
        }

        try {
            const buffer = await paptt();

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
