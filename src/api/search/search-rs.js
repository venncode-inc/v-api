const axios = require("axios");

module.exports = function (app) {
    app.get("/search/rs", async (req, res) => {
        const { kota } = req.query;

        if (!kota) {
            return res.json({
                status: false,
                creator: "Hazel",
                error: "Masukkan nama kota!"
            });
        }

        try {
            const rsRes = await axios.get("https://dekontaminasi.com/api/id/covid19/hospitals");
            let hospitals = rsRes.data;

            // Filter berdasarkan nama kota yang ada di region atau address
            hospitals = hospitals.filter(h =>
                h.region.toLowerCase().includes(kota.toLowerCase()) ||
                h.address.toLowerCase().includes(kota.toLowerCase())
            );

            // Ambil maksimal 2 rumah sakit aja
            const limitedResults = hospitals.slice(0, 2);

            res.json({
                status: true,
                creator: "Hazel",
                total: limitedResults.length,
                result: limitedResults
            });

        } catch (e) {
            res.json({
                status: false,
                creator: "Hazel",
                error: e.message
            });
        }
    });
};
