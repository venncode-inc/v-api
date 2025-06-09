const axios = require('axios');
const GUN = require('gun');

const deployTimestamp = new Date('2025-06-05T03:00:00Z');
const jsonBlobUrl = 'https://jsonblob.com/api/jsonBlob/1381662714862166016';

const gun = GUN();
const statNode = gun.get('statData');

let statData = {
  totalRequest: 0,
};

// load data dari JSONBlob pakai axios
async function loadStatData() {
  try {
    const res = await axios.get(jsonBlobUrl);
    if (res.data && typeof res.data.totalRequest === 'number') {
      statData = res.data;
      statNode.put(statData); // update Gun juga
      console.log('StatData berhasil di-load dari JSONBlob');
    }
  } catch (err) {
    console.log('Gagal load data dari JSONBlob, pakai data default');
  }
}

// update JSONBlob pakai axios
async function updateJsonBlob(data) {
  try {
    await axios.put(jsonBlobUrl, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('StatData berhasil di-update ke JSONBlob');
  } catch (err) {
    console.error('Gagal update JSONBlob:', err.message);
  }
}

module.exports = function(app) {
  loadStatData();

  app.use(async (req, res, next) => {
    statData.totalRequest++;
    req.statData = statData;

    statNode.put(statData); // update Gun realtime

    updateJsonBlob(statData).catch(e => {
      console.error('Error update JSONBlob async:', e.message);
    });

    next();
  });

  // ...endpoint dan fungsi lain tetap sama
};
