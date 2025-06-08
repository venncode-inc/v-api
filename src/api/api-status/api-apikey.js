const axios = require('axios');

const apiKeys = [
            "1f4d9b6e-8c7a-4b5f-9d3e-2f9f9a93c1e0",
            "a0c27f44-1d2b-4279-9d30-3b8e57d3e3a6",
            "e7a2d7b9-8f0c-4a6f-8f2a-5c9fbb4d6a87",
            "3c1b7a2e-5d6f-4b2a-8c1f-2e9a7c4b3d29",
            "d59e4b08-3a7c-4f6b-9a2e-7c5f9d8a1b2c",
            "b8a7c2d1-1f4e-4c3a-9d8b-3e6f5a7c9d0e",
            "f3b9d8a7-2e5f-4a1b-8c7d-6f9e3b0a1c2d",
            "9c4a7f3e-8d1b-4c6f-9e2a-5b7d3f8a0c9e",
            "2e5f9d8a-3b7c-4a1f-9c0e-6d8b2a7f5e1d",
            "6f1a8c7d-4b3e-9d0f-2a5c-7e9b8d3f1a6c",
            "5a7c9d0e-1f2b-4e3d-8c6a-9b0f7d5e2a3c",
            "8d0f6b9e-3a7c-1f2e-4b5d-9c8a7f0e3d1b",
            "0c9e5b7d-8a3f-4d1b-9e2a-7f6c8d0b3a5e",
            "4b3d9c8a-7f0e-1b2c-5a6d-3e9f8d7b0c1a",
            "7d5e2a3c-9b0f-6c8d-4e1b-0f7d9a3c5e2b",
            "3a1b8d0f-6e9c-5b7d-2a4f-0e3c1f9b7a6d",
            "9e2a7f6c-8d0b-3a5e-4b3d-1c7a9f8d0e6b",
            "1f2e4b5d-9c8a-7f0e-3d1b-6c8d5a7e0f9b",
            "5c7d0b3a-1e6f-9b8d-4c2a-0f3e7d9a1b5c",
            "2a4f0e3c-1f9b-7a6d-8e2c-5b7d3a9f0c1e"
];

function getRandomApiKey() {
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  return apiKeys[randomIndex];
}

app.post('/api-status/create-apikey', async (req, res) => {
  try {
    const nomor = req.body.nomor;
    if (!nomor) {
      return res.status(400).json({ status: false, message: 'Nomor telepon wajib diisi' });
    }

    const apikey = getRandomApiKey();
    const domain = req.hostname;
    const status = 'done';
    const tanggal = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    const webhookURL = 'https://discord.com/api/webhooks/1381323318015168713/n7-0frn24IaSz4BXK3nD6TnLTYKzNq8iZxq8RWkUDmEF0P35Dz_9o_ALgjDQkyFx78h9';

    const embedPayload = {
      embeds: [
        {
          title: "🚀 API Key Created",
          color: 0x00FF00,
          fields: [
            { name: "Nomor", value: nomor, inline: true },
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
