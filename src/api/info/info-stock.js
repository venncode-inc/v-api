const axios = require('axios');

module.exports = function(app) {
    app.get('/info/stock', async (req, res) => {
        try {
            const response = await axios.get('https://zenzxz.dpdns.org/info/blockfruitsstock');

            const data = response.data;

            // Paksa ubah author jadi Hazel, tanpa mengubah format data lainnya
            if (typeof data === 'object') {
                data.author = 'Hazel';
            }

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                status: false,
                author: 'Hazel',
                message: `Error: ${error.message}`
            });
        }
    });
};
