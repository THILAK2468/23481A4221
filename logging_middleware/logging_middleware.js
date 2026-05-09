const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJleHAiOjE3NzgzMTA0MzIsImlhdCI6MTc3ODMwOTUzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImI3ZWVkZTYxLTg4OTItNDU5OS04MjFlLTZlNjc0N2U5MGI5YyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImNob2RhZ2lyaSB0aGlsYWsiLCJzdWIiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MifSwiZW1haWwiOiJ0aGlsYWt0bGtjaG9kYWdpcmlAZ21haS5jb20iLCJuYW1lIjoiY2hvZGFnaXJpIHRoaWxhayIsInJvbGxObyI6IjIzNDgxYTQyMjEiLCJhY2Nlc3NDb2RlIjoiZUpkQ3VDIiwiY2xpZW50SUQiOiJlYzFmMzNiMS0xYjdjLTRhOWYtOTQ1YS1lNjk5OTc1NjBiM2MiLCJjbGllbnRTZWNyZXQiOiJ0cFdiRkZWaGpuS2VKTm5IIn0.A0cS10rbmsbG0b6RNHDcIEj5Jz4MR579GtQChxSam_4";
const valid_stack = ['backend', 'frontend'];

const valid_level = ['debug', 'info', 'warn', 'error', 'fatal'];

const valid_packages = [
  'cache', 'controller', 'cron_job', 'db', 'domain',
  'handler', 'repository', 'route', 'service',
  'api', 'component', 'hook', 'page', 'state', 'style',
  'auth', 'config', 'middleware', 'utils'
];

async function Log(stack, level, pkg, message) {
  if (!valid_stack.includes(stack)) {
    console.error(`[Logger] Invalid stack: ${stack}`);
    return;
  }
  if (!valid_level.includes(level)) {
    console.error(`[Logger] Invalid level: ${level}`);
    return;
  }
  if (!valid_packages.includes(pkg)) {
    console.error(`[Logger] Invalid package: ${pkg}`);
    return;
  }

  console.log(`[${level.toUpperCase()}] [${stack}/${pkg}] ${message}`);

  try {
    const res = await fetch('http://4.224.186.213/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg, 
        message
      })
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`[Logger]  Log sent | logID: ${data.logID}`);
    } else {
      console.error(`[Logger] Server rejected: ${JSON.stringify(data)}`);
    }

  } catch (err) {
    console.error(`[Logger] Network error: ${err.message}`);
  }
}

module.exports = { Log };