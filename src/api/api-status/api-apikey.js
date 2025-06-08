const moment = require('moment'); // buat format tanggal

app.post('/api-status/create-apikey', async (req, res) => {
  try {
    const nomor = req.body.nomor;
    if (!nomor) {
      return res.status(400).json({ status: false, message: 'Nomor telepon wajib diisi' });
    }

    const userid = generateRandomString(8);
    const apikey = generateRandomString(16);
    const domain = req.hostname;
    const status = 'done';
    const tanggal = moment().format('YYYY-MM-DD');

    const webhookURL = 'https://discord.com/api/webhooks/XXX/YYY'; // ganti webhook kamu

    const embedPayload = {
      // tanpa mention apapun
      embeds: [
        {
          title: "🚀 API Key Created",
          color: 0x00FF00,
          fields: [
            { name: "Nomor", value: nomor, inline: true },
            { name: "UserID", value: userid, inline: true },
            { name: "API Key", value: apikey, inline: false },
            { name: "Domain", value: domain, inline: false }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `API Key ${status} | ${tanggal}`,
            icon_url: 'https://i.imgur.com/AfFp7pu.png'
          }
        }
      ]
    };

    await axios.post(webhookURL, embedPayload);

    res.json({
      status: true,
      creator: 'Hazel',
      data: {
        nomor,
        userid,
        apikey,
        domain
      }
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Gagal membuat API key',
      error: error.message
    });
  }
});
