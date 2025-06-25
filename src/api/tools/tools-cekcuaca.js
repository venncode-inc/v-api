const axios = require('axios');

// Ambil semua data wilayah BMKG untuk cari kode wilayah
async function getKodeWilayah(kota) {
  try {
    const res = await axios.get('https://ibnux.github.io/BMKG-importer/cuaca/wilayah.json');
    const wilayah = res.data.find(w => w.kota.toLowerCase() === kota.toLowerCase());
    if (!wilayah) throw new Error('Kota tidak ditemukan');
    return wilayah.id;
  } catch (e) {
    throw new Error('Gagal mendapatkan kode wilayah');
  }
}

// Ambil data cuaca berdasarkan kode wilayah
async function getCuacaByKode(kodeWilayah) {
  try {
    const res = await axios.get(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeWilayah}`);
    return res.data;
  } catch (e) {
    throw new Error('Gagal mengambil data cuaca dari BMKG');
  }
}

module.exports = function(app) {
  app.get('/tools/cekcuaca', async (req, res) => {
    const kota = req.query.kota;
    if (!kota) return res.status(400).json({ status: false, message: 'Parameter ?kota wajib diisi' });

    try {
      const kode = await getKodeWilayah(kota);
      const data = await getCuacaByKode(kode);
      res.json({ status: true, result: data });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  });
};
