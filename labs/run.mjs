import assert from 'node:assert/strict';
import { runLoop } from './01-agent-loop.mjs';
import { initial, reduce, runState } from './02-agent-state.mjs';
import { runRetry, retryRead, createFakeService } from './03-tool-retry.mjs';
const loop = runLoop();
assert.equal(loop.outcome, 'completed'); assert.equal(loop.actions, 1);
assert.equal(runLoop(0).outcome, 'budget_exhausted');
console.log('01 completed / actions=1；零額度：budget_exhausted');
const state = await runState();
assert.equal(state.phase, 'completed'); assert.equal(state.pendingTool, null);
assert.throws(() => reduce(initial(), { kind: 'verified', passed: true }), /illegal transition/);
console.log('02 completed / observations=1；非法驗收事件：拒絕');
const retry = await runRetry();
assert.equal(retry.attempts, 3); assert.equal(retry.state.actions, 1);
assert.deepEqual(retry.waits, [100, 200]);
let invalidCalls = 0;
await assert.rejects(retryRead(async () => {
  invalidCalls++; throw Object.assign(new Error('invalid'), { kind: 'invalid' });
}, { wait: async () => {}, random: () => 0.5 }), /invalid/);
assert.equal(invalidCalls, 1);
const service = createFakeService();
const request = { opId: 'login-42:report-1', body: '空白 token 未排除' };
const lostReply = service.create(request); // 假設呼叫者沒有收到這份回應。
assert.deepEqual(service.create(request), lostReply);
assert.equal(service.comments.length, 1);
assert.throws(() => service.create({ ...request, body: '不同內容' }), /key_conflict/);
service.create({ ...request, opId: 'new-key' }); assert.equal(service.comments.length, 2);
console.log('03 attempts=3 / actions=1；invalid 首次停止；同 key=1 則，新 key=2 則');
console.log('所有累積範例驗收通過。');
