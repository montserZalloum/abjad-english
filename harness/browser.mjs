// browser.mjs — drive headless Chrome over the DevTools protocol, no dependencies.
//
// This is DRIVER code, not assertions: the same class of carve-out as appproc.py.
// Both harness/journey.mjs (builder-visible) and .factory/holdout/journey.mjs
// (builder-blocked) import it. ASSERTIONS live in those journey files, never here.
//
// Pattern proven on letter-islands/scripts/smoke.mjs.
//
// Two rules baked in from the harness README:
//   - Chrome is spawned with stdio:'ignore' and killed in close(), so no daemon
//     inherits a stdout pipe and hangs the gate.
//   - A missing browser is a FAILURE at launch, never a zero-assertion clean run.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { existsSync } from 'node:fs';

const CHROME = process.env.CHROME
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchBrowser({ tag = 'harness', width = 1280, height = 800 } = {}) {
  if (!existsSync(CHROME)) {
    throw new Error(
      `no browser at ${CHROME} - set CHROME to a Chromium binary. ` +
      'A missing browser is a FAILURE, not a clean run with zero assertions.');
  }
  // A fresh profile per run: progress persistence must be proven against a store
  // the run itself created, never a carried-over one.
  const profile = `/tmp/abjad-${tag}-${process.pid}`;
  rmSync(profile, { recursive: true, force: true });
  const debugPort = 9300 + (process.pid % 400);

  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${debugPort}`,
    `--window-size=${width},${height}`, '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  let ws; let msgId = 0;
  const pending = new Map();
  const consoleErrors = [];
  const failedRequests = [];

  function send(method, params = {}) {
    const id = ++msgId;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => pending.set(id, { res, rej }));
  }

  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
        break;
      }
    } catch { /* not up yet */ }
    // eslint-disable-next-line no-await-in-loop
    await sleep(200);
    if (i === 49) { chrome.kill(); throw new Error('could not attach to Chrome'); }
  }

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(m.error.message)); else res(m.result);
      return;
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      const text = (m.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ');
      consoleErrors.push(`console.error: ${text}`);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      consoleErrors.push(`uncaught: ${d.exception?.description || d.text}`);
    }
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
      failedRequests.push(`${m.params.response.status} ${m.params.response.url}`);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile: false });

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
    }
    return r.result?.value;
  }

  return {
    evaluate,
    // Real pointer events, the way a child's finger does it.
    async tap(selector) {
      await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error('no element for ${selector}');
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        el.click();
      })()`);
    },
    async navigate(url) {
      await send('Page.navigate', { url });
      await sleep(1200);
    },
    async waitFor(expression, ms = 8000) {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        if (await evaluate(expression)) return true;
        await sleep(250);
      }
      return false;
    },
    async screenshot(path) {
      mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path, Buffer.from(r.data, 'base64'));
    },
    consoleErrors,
    failedRequests: () => failedRequests.filter((f) => !f.includes('favicon')),
    async close() {
      try { ws?.close(); } catch { /* already gone */ }
      chrome.kill();
      // Chrome keeps writing the profile for a moment after SIGTERM; rm without
      // retries races it and dies ENOTEMPTY.
      await sleep(300);
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    },
  };
}
