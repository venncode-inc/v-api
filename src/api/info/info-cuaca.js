const axios = require('axios');

// ambil json gempa
async function getGempa() {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    return response.data.Infogempa.gempa;
  } catch (e) {
    throw new Error('gagal ambil data gempa');
  }
}

// ambil nama wilayah dari kode wilayah
async function getNamaWilayah(kode) {
  try {
    const wilayah = await axios.get('https://ibnux.github.io/BMKG-importer/cuaca/wilayah.json');
    const data = wilayah.data.find(item => item.id === kode);
    if (!data) throw new Error('kode wilayah tidak ditemukan');
    return data.kota;
  } catch (e) {
    throw new Error('gagal ambil data wilayah');
  }
}

module.exports = function (app) {
  app.get('/info/cuaca', async (req, res) => {
    const kode = req.query.kode;
    if (!kode) return res.status(400).json({ status: false, message: 'parameter ?kode wajib diisi' });

    try {
      const namaWilayah = await getNamaWilayah(kode);
      const gempa = await getGempa();

      // cek apakah wilayah cocok
      const wilayahGempa = gempa.Wilayah.toLowerCase();
      const cocok = wilayahGempa.includes(namaWilayah.toLowerCase());

      if (!cocok) {
        return res.json({
          status: true,
          message: `tidak ada gempa terbaru yang tercatat di wilayah ${namaWilayah}`,
        });
      }

      res.json({
        status: true,
        result: {
          wilayah: gempa.Wilayah,
          waktu: `${gempa.Tanggal} ${gempa.Jam}`,
          magnitude: gempa.Magnitude,
          kedalaman: gempa.Kedalaman,
          koordinat: gempa.Coordinates,
          potensi: gempa.Potensi,
          dirasakan: gempa.Dirasakan || 'tidak ada info dirasakan',
          peta: gempa.Shakemap
            ? `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`
            : null,
        },
      });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  });
};
