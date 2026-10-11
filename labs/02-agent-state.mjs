// 沿用 01 的假模型、工具與驗收；把轉移集中成 reducer。
import { decide, readFile, verify } from './01-agent-loop.mjs';
export function initial(maxActions = 3) {
  return { phase: 'thinking', observations: [], actions: 0, maxActions, pendingTool: null, answer: '' };
}
export function reduce(state, event) {
  if (state.phase === 'thinking' && event.kind === 'tool_requested') {
    return state.actions >= state.maxActions ? { ...state, phase: 'budget_exhausted' }
      : { ...state, phase: 'acting', pendingTool: event.tool };
  }
  if (state.phase === 'acting' && event.kind === 'tool_succeeded') {
    return { ...state, phase: 'thinking', pendingTool: null,
      actions: state.actions + 1, observations: [...state.observations, event.result] };
  }
  if (state.phase === 'thinking' && event.kind === 'finish_proposed') {
    return { ...state, phase: 'verifying', answer: event.answer };
  }
  if (state.phase === 'verifying' && event.kind === 'verified') {
    return { ...state, phase: event.passed ? 'completed' : 'rejected' };
  }
  throw new Error(`illegal transition: ${state.phase} + ${event.kind}`);
}
export async function runState(execute = async () => readFile(), maxActions = 3) {
  let state = initial(maxActions);
  while (state.phase === 'thinking') {
    const decision = decide(state);
    if (decision.kind === 'finish') {
      state = reduce(state, { kind: 'finish_proposed', answer: decision.answer });
      state = reduce(state, { kind: 'verified', passed: verify(state.answer, state.observations) });
    } else {
      state = reduce(state, { kind: 'tool_requested', tool: decision });
      if (state.phase === 'acting') state = reduce(state, {
        kind: 'tool_succeeded', result: await execute(decision)
      });
    }
  }
  return state;
}
// 教學成功路徑；沒有等待／持久化。工具例外由呼叫者處理。
