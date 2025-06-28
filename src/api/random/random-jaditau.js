const axios = require('axios');

module.exports = function(app) {
    async function getRandomJadiTau() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/rooxJSphire/rawFitur/main/jadiTau.json');
            const list = Array.isArray(data) ? data : data.kata;
            const randomText = list[Math.floor(Math.random() * list.length)];
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
                message: `Error: ${error.message}`
            });
        }
    });
};
