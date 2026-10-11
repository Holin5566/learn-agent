// 沿用 02 的 runState；只替換 execute，不改模型與路由。
import { runState } from './02-agent-state.mjs';
import { readFile } from './01-agent-loop.mjs';
export async function retryRead(read, { wait, random, maxAttempts = 3 }) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await read(); }
    catch (error) {
      if (error.kind !== 'temporary' || attempt === maxAttempts) throw error;
      await wait(random() * Math.min(1000, 200 * 2 ** (attempt - 1)));
    }
  }
  throw new Error('invalid maxAttempts');
}
export async function runRetry() {
  let attempts = 0;
  const waits = [];
  const state = await runState(() => retryRead(async () => {
    attempts++;
    if (attempts < 3) throw Object.assign(new Error('temporary'), { kind: 'temporary' });
    return readFile();
  }, { wait: async ms => { waits.push(ms); }, random: () => 0.5 }));
  return { state, attempts, waits };
}
export function createFakeService() {
  const ledger = new Map();
  const comments = [];
  return { comments, create({ opId, body }) {
    const previous = ledger.get(opId);
    if (previous) {
      if (previous.body !== body) throw new Error('key_conflict');
      return previous.receipt;
    }
    const receipt = { commentId: `comment-${comments.length + 1}` };
    comments.push(body);
    ledger.set(opId, { body, receipt });
    return receipt;
  } };
}
// Map 只示範單程序同步契約，不提供跨程序或遠端去重。
