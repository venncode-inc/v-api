const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
  app.get('/imagecreator/hdin', async (req, res) => {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "image_url" wajib diisi. Contoh: /imagecreator/hdin?image_url=https://example.com/foto.jpg'
      });
    }

    try {
      // Download gambar dari URL
      const imgResponse = await axios.get(image_url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imgResponse.data);

      // Siapkan form data untuk waifu2x
      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: 'image.png' });
      formData.append('scale', '2');
      formData.append('noise', '1');

      // Kirim ke waifu2x
      const upscaleResponse = await axios.post(
        'https://api.waifu2x.booru.pics/api',
        formData,
        {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const contentType = upscaleResponse.headers['content-type'];

      // Jika hasil berupa gambar, upload ke Catbox
      if (contentType && contentType.startsWith('image/')) {
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'fileupload');
        catboxForm.append('userhash', ''); // Kosong jika tidak login
        catboxForm.append('fileToUpload', Buffer.from(upscaleResponse.data), { filename: 'upscaled.png' });

        const catboxUpload = await axios.post(
          'https://catbox.moe/user/api.php',
          catboxForm,
          {
            headers: catboxForm.getHeaders()
          }
        );

        return res.json({
          status: true,
          message: 'Berhasil mengubah gambar menjadi HD dan mengupload ke Catbox',
          creator: 'Hazel',
          result: catboxUpload.data // Link file
        });
      }

      res.status(500).json({
        status: false,
        message: 'Hasil bukan berupa gambar.',
        creator: 'Hazel'
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengupscale gambar',
        error: err.message,
        creator: 'Hazel'
      });
    }
  });
};
