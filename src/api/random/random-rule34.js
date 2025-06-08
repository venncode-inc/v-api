const axios = require('axios');

module.exports = function(app) {
    async function rule34() {
        try {
            const { data } = await axios.get(`https://api.nekorinn.my.id/random/rule34`);
            const imageUrl = data[Math.floor(Math.random() * data.length)];
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/rule34', async (req, res) => {
        try {
            const { apikey } = req.query;

            if (!global.apikey || !Array.isArray(global.apikey) || !global.apikey.includes(apikey)) {
                return res.status(403).json({ status: false, error: 'Apikey invalid' });
            }

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
