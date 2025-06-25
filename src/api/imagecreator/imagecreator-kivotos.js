const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

module.exports = function (app) {
  app.get('/imagecreator/nsfwtext2img', async (req, res) => {
    const { text, style = 'anime' } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /imagecreator/nsfwtext2img?text=1girl,%20bath'
      });
    }

    const allowedStyle = ['anime', 'real', 'photo'];
    if (!allowedStyle.includes(style)) {
      return res.status(400).json({
        status: false,
        message: `Style harus salah satu dari: ${allowedStyle.join(', ')}`
      });
    }

    try {
      const proxyRes = await axios.get('https://api.nekorinn.my.id/tools/freeproxy');
      const proxies = proxyRes.data?.result;

      if (!Array.isArray(proxies) || proxies.length === 0) {
        return res.status(500).json({ status: false, message: 'Gagal mendapatkan list proxy dari API' });
      }

      const picked = proxies[Math.floor(Math.random() * proxies.length)];
      const proxyUrl = `http://${picked.ip}:${picked.port}`;
      const agent = {
        httpsAgent: new HttpsProxyAgent(proxyUrl)
      };

      const session_hash = Math.random().toString(36).substring(2);
      const baseURL = `https://heartsync-nsfw-uncensored${style !== 'anime' ? `-${style}` : ''}.hf.space`;

      await axios.post(`${baseURL}/gradio_api/queue/join?`, {
        data: [
          text,
          'lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, watermark, blurry',
          0,
          true,
          1024,
          1024,
          7,
          28
        ],
        event_data: null,
        fn_index: 2,
        trigger_id: 16,
        session_hash
      }, agent);

      // 2. ambil hasil dari queue
      const queue = await axios.get(`${baseURL}/gradio_api/queue/data?session_hash=${session_hash}`, agent);
      const lines = queue.data.split('\n\n');

      let imageUrl;
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.msg === 'process_completed') {
            imageUrl = parsed.output.data[0].url;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ status: false, message: 'Gagal mendapatkan gambar dari model AI' });
      }

      // 3. ambil gambar & kirim langsung
      const image = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        httpsAgent: new HttpsProxyAgent(proxyUrl)
      });

      res.set('Content-Type', 'image/jpeg');
      res.send(image.data);

    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal proses gambar',
        error: err.message
      });
    }
  });
};
