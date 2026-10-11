// 固定決策與假工具：不連網、不讀取專案檔案。
export const evidence = 'login.ts：空白 token 仍通過驗證';
export function decide(state) {
  return state.observations.length
    ? { kind: 'finish', answer: '登入驗證未排除空白 token。' }
    : { kind: 'tool', name: 'readFile' };
}
export function readFile() { return evidence; }
export function verify(answer, observations) {
  return observations.includes(evidence) && answer.includes('空白 token');
}
export function runLoop(maxActions = 3) {
  const state = { observations: [], actions: 0 };
  while (true) {
    const decision = decide(state);
    if (decision.kind === 'finish') return {
      outcome: verify(decision.answer, state.observations) ? 'completed' : 'rejected',
      ...state
    };
    if (state.actions >= maxActions) return { outcome: 'budget_exhausted', ...state };
    state.observations.push(readFile());
    state.actions++;
  }
}
