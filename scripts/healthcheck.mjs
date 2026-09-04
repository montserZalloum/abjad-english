// Deploy health check: serve THIS build, fetch it, assert a user-visible outcome,
// exit. Run from inside the build snapshot by factory/deploy.sh.
//
// The marker HEALTHY is what deploy.sh greps for. A build that serves a page without
// the app's title is not healthy, whatever the status code said.

import { spawn } from 'node:child_process';

const server = spawn(process.execPath, ['scripts/serve.mjs', '0'], {
  stdio: ['ignore', 'pipe', 'inherit'],
});

let port = null;
server.stdout.on('data', (chunk) => {
  const m = String(chunk).match(/localhost:(\d+)/);
  if (m) port = Number(m[1]);
});

const deadline = Date.now() + 10000;
while (port === null && Date.now() < deadline) {
  // eslint-disable-next-line no-await-in-loop
  await new Promise((r) => setTimeout(r, 100));
}

try {
  if (port === null) throw new Error('server never reported a port');
  const res = await fetch(`http://127.0.0.1:${port}/index.html`);
  const body = await res.text();
  if (res.status !== 200) throw new Error(`status=${res.status}`);
  if (!body.includes('أبجد إنجليزي')) throw new Error('the page does not name the app');
  if (!body.includes('src/app.js')) throw new Error('the page does not load the app');
  console.log(`HEALTHY port=${port}`);
} catch (e) {
  console.error(`UNHEALTHY: ${e.message}`);
  process.exitCode = 1;
} finally {
  server.kill();
}
