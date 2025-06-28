const axios = require('axios');

module.exports = function(app) {
    async function getRandomJadiTau() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/rooxJSphire/rawFitur/main/jadiTau.json');

            if (!Array.isArray(data)) throw new Error("Format data bukan array!");

            const randomText = data[Math.floor(Math.random() * data.length)];
            return randomText;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/jaditau', async (req, res) => {
        try {
            const result = await getRandomJadiTau();
            res.json({
                status: true,
                creator: 'Hazel',
                message: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: 'Hazel',
                message: `Error: ${error.message}`
            });
        }
    });
};
