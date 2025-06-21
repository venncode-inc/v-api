const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    const rateLimit = {};
    const LIMIT = 5;
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

    async function scrapeGrowStock() {
        const { data: html } = await axios.get('https://growagardenpro.com/stock/');
        const $ = cheerio.load(html);
        const stock = [];

        $('table tbody tr').each((i, el) => {
            const td = $(el).find('td');
            const nama = $(td[0]).text().trim();
            const rarity = $(td[1]).text().trim();
            const stok = $(td[2]).text().trim();
            const waktu = $(td[3]).text().trim();

            if (nama && stok) {
                stock.push({ nama, rarity, stok, waktu });
            }
        });

        return stock;
    }

    app.get('/live/stock', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;

        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                author: 'Hazel',
                error: 'Rate limit exceeded. Maksimal 5 request per jam.'
            });
        }

        try {
            const stockData = await scrapeGrowStock();

            res.json({
                status: true,
                author: 'Hazel',
                message: 'Berhasil mengambil data stock Grow A Garden',
                total: stockData.length,
                data: stockData
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                author: 'Hazel',
                error: 'Gagal mengambil data dari halaman Grow A Garden',
                message: error.message
            });
        }
    });
};
