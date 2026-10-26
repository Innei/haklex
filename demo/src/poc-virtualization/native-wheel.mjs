import { execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const [session, pageUrl, output] = process.argv.slice(2);
if (!session || !pageUrl || !output) {
  throw new Error('Usage: node native-wheel.mjs <agent-browser-session> <page-url> <output.json>');
}
const { stdout } = await promisify(execFile)('agent-browser', [
  '--session',
  session,
  'get',
  'cdp-url',
]);
const cdp = new URL(stdout.trim());
const origin = `http://${cdp.host}`;
const pages = await (await fetch(`${origin}/json/list`)).json();
const page = pages.find((entry) => entry.url === pageUrl);
if (!page) throw new Error('POC tab is missing');
const protocol = await (await fetch(`${origin}/json/protocol`)).json();
if (
  !protocol.domains
    .find((domain) => domain.domain === 'Input')
    ?.commands.some((command) => command.name === 'dispatchMouseEvent')
) {
  throw new Error('Native mouse input is unavailable');
}
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let serial = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  const item = pending.get(response.id);
  if (!item) return;
  pending.delete(response.id);
  if (response.error) item.reject(new Error(JSON.stringify(response.error)));
  else item.resolve(response.result);
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const response = await call('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
const point = await evaluate(
  '(()=>{const r=document.querySelector(".poc-viewport").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/3};})()',
);
const initial = await evaluate('document.querySelector(".poc-viewport").scrollTop');
const events = [];
for (const deltaY of [
  ...Array.from({ length: 12 }).fill(1400),
  ...Array.from({ length: 12 }).fill(-1400),
]) {
  await call('Input.dispatchMouseEvent', { type: 'mouseWheel', ...point, deltaX: 0, deltaY });
  const sample = await evaluate(
    'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const root=document.querySelector(".poc-viewport"),r=root.getBoundingClientRect(),target=document.elementFromPoint(r.x+r.width/2,r.y+r.height/3)?.closest("[data-probe-block]");resolve({top:root.scrollTop,height:root.scrollHeight,placeholder:target?.getAttribute("data-mounted")==="false"});})))',
  );
  events.push({ deltaY, ...sample });
}
socket.close();
if (!events.some((entry) => entry.top > initial + 1000))
  throw new Error('Native wheel did not scroll the POC');
await writeFile(output, JSON.stringify({ initial, point, events }, null, 2));
process.stdout.write(
  JSON.stringify({
    inputs: events.length,
    scrollRange: [
      Math.min(...events.map((entry) => entry.top)),
      Math.max(...events.map((entry) => entry.top)),
    ],
    placeholders: events.filter((entry) => entry.placeholder).length,
  }) + '\n',
);
