const axios = require('axios');

module.exports = function(app) {
    async function paptt() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/paptt.json');
            const randomUrl = data[Math.floor(Math.random() * data.length)];
            const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/paptt', async (req, res) => {
        try {
            const { apikey } = req.query;

            // cek api key
            if (!global.apikey || !Array.isArray(global.apikey) || !global.apikey.includes(apikey)) {
                return res.status(403).json({ status: false, error: 'Apikey invalid' });
            }

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
