const axios = require('axios');

module.exports = function(app) {
    async function Neko() {
        try {
            const { data } = await axios.get(`https://nekos.life/api/neko`);
            const url = data.url || data;

            // ambil ekstensi
            const ext = url.split('.').pop().toLowerCase();

            // manual content-type
            let contentType = 'application/octet-stream';
            if (ext === 'png') contentType = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
            else if (ext === 'gif') contentType = 'image/gif';
            else if (ext === 'mp4') contentType = 'video/mp4';

            const response = await axios.get(url, { responseType: 'arraybuffer' });

            return {
                buffer: Buffer.from(response.data),
                contentType
            };
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/neko', async (req, res) => {
        try {
            const media = await Neko();
            res.writeHead(200, {
                'Content-Type': media.contentType,
                'Content-Length': media.buffer.length,
            });
            res.end(media.buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
