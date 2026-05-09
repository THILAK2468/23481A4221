const { Log } = require('../logging_middleware/logger');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJleHAiOjE3NzgzMTA0MzIsImlhdCI6MTc3ODMwOTUzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImI3ZWVkZTYxLTg4OTItNDU5OS04MjFlLTZlNjc0N2U5MGI5YyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImNob2RhZ2lyaSB0aGlsYWsiLCJzdWIiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MifSwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJuYW1lIjoiY2hvZGFnaXJpIHRoaWxhayIsInJvbGxObyI6IjIzNDgxYTQyMjEiLCJhY2Nlc3NDb2RlIjoiZUpkQ3VDIiwiY2xpZW50SUQiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MiLCJjbGllbnRTZWNyZXQiOiJ0cFdiRkZWaGpuS2VKTm5IIn0.A0cS10rbmsbG0b6RNHDcIEj5Jz4MR579GtQChxSam_4";

const type_weight = { Placement: 3, Result: 2, Event: 1 };

async function gettopn(n = 10) {
  try {
    Log('backend', 'info', 'handler', `Fetching top ${n} priority notifications`);

    const res = await fetch('http://4.224.186.213/evaluation-service/notifications', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const { notifications } = await res.json();
    Log('backend', 'info', 'service', `Fetched ${notifications.length} notifications`);

    const Times = notifications.map(n => new Date(n.Timestamp).getTime());
    const MinTime = Math.min(...Times);
    const MaxTime = Math.max(...Times);

    const scored = notifications.map(n => ({
      ...n,
      score: type_weight[n.Type] +
        (MaxTime === MinTime ? 1 :
        (new Date(n.Timestamp).getTime() - MinTime) / (MaxTime - MinTime))
    }));

    const topn = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

    console.log(`\nTOP ${n} PRIORITY NOTIFICATIONS:`);
    topn.forEach((n, i) => {
      console.log(
        `${i + 1}. [${n.Type}] "${n.Message}" | Score: ${n.score.toFixed(3)} | ${n.Timestamp}`
      );
    });

    Log('backend', 'info', 'controller', `Top ${n} notifications displayed successfully`);

  } catch (err) {
    Log('backend', 'fatal', 'handler', `Priority inbox failed: ${err.message}`);
    console.error(err);
  }
}

gettopn(10);