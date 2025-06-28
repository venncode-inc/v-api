async function updateAPICards() {
  try {
    const res = await fetch("https://zelapioffciall.vercel.app/api-status/status");
    const json = await res.json();
    const data = json.result;

    document.getElementById("totalApi").textContent = data.totalfitur ?? "-";
    document.getElementById("totalRequests").textContent = data.totalrequest ?? "-";
    document.getElementById("avgResponse").textContent = data.avgResponseTime ?? "-";
    document.getElementById("successRate").textContent = data.successRate ?? "-";
    document.getElementById("errorRate").textContent = data.errorRate ?? "-";
  } catch (err) {
    console.error("Gagal ambil data dari API stats:", err);
  }
}

updateAPICards();
setInterval(updateAPICards, 60000); // 1 menit

// Grafik ping Google
const ctx = document.getElementById('pingChart').getContext('2d');
const pingData = {
  labels: [],
  datasets: [{
    label: 'Server Latency',
    data: [],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    tension: 0.3
  }]
};

const pingChart = new Chart(ctx, {
  type: 'line',
  data: pingData,
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Latency (ms)' }
      },
      x: {
        title: { display: true, text: 'Waktu' }
      }
    },
    plugins: {
      legend: {
        labels: { font: { size: 10 } }
      }
    }
  }
});

function pingGoogle() {
  const start = performance.now();
  fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
    .finally(() => {
      const latency = Math.round(performance.now() - start);
      const timeLabel = new Date().toLocaleTimeString();

      if (pingData.labels.length >= 20) {
        pingData.labels.shift();
        pingData.datasets[0].data.shift();
      }

      pingData.labels.push(timeLabel);
      pingData.datasets[0].data.push(latency);
      pingChart.update();
    });
}

setInterval(pingGoogle, 3000);
pingGoogle();
