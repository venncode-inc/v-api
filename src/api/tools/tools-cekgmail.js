const axios = require("axios");

async function cekGmail(email) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await axios.get('https://emailrep.io/' + encodeURIComponent(email));
            resolve(res.data);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = function(app) {
    app.get('/tools/cek-gmail', async (req, res) => {
        const email = req.query.email;

        if (!email) {
            return res.json({ status: false, error: 'Email is required' });
        }

        // validasi email harus @gmail.com
        if (!/^[^\s@]+@gmail\.com$/.test(email)) {
            return res.json({ status: false, error: 'Only Gmail addresses are allowed' });
        }

        try {
            const hasil = await cekGmail(email);
            res.status(200).json({
                status: true,
                result: hasil
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
