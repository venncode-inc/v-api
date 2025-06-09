const axios = require('axios');

const deployTimestamp = new Date('2025-06-05T03:00:00Z');
const jsonBlobUrl = 'https://jsonblob.com/api/jsonBlob/1381695837767393280';

const owner = 'hazelnuttty';
const repo = 'API';
const path = 'Api.json';
const branch = 'main';

let GITHUB_TOKEN = null;
let statData = { totalRequest: 0 };

// ambil token dari JSONBlob
async function loadGithubToken() {
  try {
    const res = await axios.get(jsonBlobUrl);
    GITHUB_TOKEN = res.data.github_token;
    console.log('✅ Token berhasil di-load dari JSONBlob');
  } catch (err) {
    console.error('❌ Gagal ambil token dari JSONBlob');
  }
}

// ambil data Api.json dari GitHub
async function loadStatDataFromGitHub() {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3.raw'
    }
  });
  return res.data;
}

// ambil SHA untuk update
async function getFileSha() {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    }
  });
  return res.data.sha;
}

// update isi file GitHub
async function updateFileOnGitHub(newContent) {
  const sha = await getFileSha();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const contentEncoded = Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64');

  const res = await axios.put(url, {
    message: 'Update totalRequest otomatis',
    content: contentEncoded,
    sha: sha,
    branch: branch
  }, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  return res.data;
}

function countRoutes() {
  return 1;
}

function formatRuntime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}j ${mins}m ${secs}d`;
}

module.exports = async function handler(req, res) {
  if (!GITHUB_TOKEN) await loadGithubToken();

  if (req.method === 'GET' && req.url === '/api-status/status') {
    try {
      const data = await loadStatDataFromGitHub();
      data.totalRequest = (data.totalRequest || 0) + 1;

      const runtime = Date.now() - deployTimestamp.getTime();

      const result = {
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: data.totalRequest.toString(),
          totalfitur: countRoutes(),
          runtime: formatRuntime(runtime),
          domain: req.headers.host || 'unknown',
        }
      };

      res.status(200).json(result);

      await updateFileOnGitHub(data); // simpan ke GitHub

    } catch (err) {
      res.status(500).json({ status: false, message: 'Gagal ambil atau update statData', error: err.message });
    }

  } else {
    res.status(404).json({ status: false, message: 'Endpoint tidak ditemukan' });
  }
};
