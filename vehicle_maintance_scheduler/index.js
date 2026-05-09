const { Log } = require('../logging_middleware/logger');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJleHAiOjE3NzgzMTA0MzIsImlhdCI6MTc3ODMwOTUzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImI3ZWVkZTYxLTg4OTItNDU5OS04MjFlLTZlNjc0N2U5MGI5YyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImNob2RhZ2lyaSB0aGlsYWsiLCJzdWIiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MifSwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJuYW1lIjoiY2hvZGFnaXJpIHRoaWxhayIsInJvbGxObyI6IjIzNDgxYTQyMjEiLCJhY2Nlc3NDb2RlIjoiZUpkQ3VDIiwiY2xpZW50SUQiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MiLCJjbGllbnRTZWNyZXQiOiJ0cFdiRkZWaGpuS2VKTm5IIn0.A0cS10rbmsbG0b6RNHDcIEj5Jz4MR579GtQChxSam_4";const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};
async function fetchData() {
  Log('backend', 'info', 'service', 'Fetching depots and vehicles from API');

  const [depotsRes, vehiclesRes] = await Promise.all([
    fetch('http://4.224.186.213/evaluation-service/depots', { headers: HEADERS }),
    fetch('http://4.224.186.213/evaluation-service/vehicles', { headers: HEADERS })
  ]);

  const { depots } = await depotsRes.json();
  const { vehicles } = await vehiclesRes.json();

  Log('backend', 'info', 'service',
    `Fetched ${depots.length} depots and ${vehicles.length} vehicles`);

  return { depots, vehicles };
}

function knapsack(vehicles, budget) {
  const n = vehicles.length;
  const dp = Array.from({ length: n + 1 },
    () => new Array(budget + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= budget; w++) {
      dp[i][w] = dp[i - 1][w];
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
      }
    }
  }

  const Selected = [];
  let w = budget;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      Selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return {
    maxImpact: dp[n][budget],
    selectedVehicles: Selected,
    totalDuration: Selected.reduce((sum, v) => sum + v.Duration, 0)
  };
}

async function main() {
  try {
    Log('backend', 'info', 'handler', 'Vehicle Maintenance Scheduler started');

    const { depots, vehicles } = await fetchData();

    for (const depot of depots) {
      Log('backend', 'debug', 'service',
        `Processing depot ${depot.ID} with budget ${depot.MechanicHours} hours`);

      const result = knapsack(vehicles, depot.MechanicHours);

      console.log(`\nDEPOT ${depot.ID}:`);
      console.log(`Budget:         ${depot.MechanicHours} hours`);
      console.log(`Max Impact:     ${result.maxImpact}`);
      console.log(`Total Duration: ${result.totalDuration} hours`);
      console.log(`Tasks Selected: ${result.selectedVehicles.length}`);
      console.log('Selected Tasks:');
      result.selectedVehicles.forEach(v => {
        console.log(`  TaskID: ${v.TaskID} | Duration: ${v.Duration}h | Impact: ${v.Impact}`);
      });

      Log('backend', 'info', 'controller',
        `Depot ${depot.ID} → Max Impact: ${result.maxImpact}, Tasks: ${result.selectedVehicles.length}`);
    }

    Log('backend', 'info', 'handler', 'Scheduler completed successfully');

  } catch (err) {
    Log('backend', 'fatal', 'handler', `Scheduler failed: ${err.message}`);
    console.error(err);
  }
}

main();