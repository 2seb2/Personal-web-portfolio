/**
 * 홈(로고)을 눌렀을 때 히어로 상태를 초기화하라는 신호. Nav(로고)와 Hero가 서로 다른
 * 컴포넌트 트리라 props로 직접 연결할 수 없어 sessionStorage 플래그로 전달한다.
 *
 * CustomEvent(window.dispatchEvent)가 아니라 sessionStorage를 쓰는 이유: Next.js
 * Router Cache가 페이지 전환 시 Hero를 리마운트하지 않고 재사용하는 경우, 로고 클릭
 * 시점(아직 이전 페이지)에는 Hero의 이벤트 리스너가 등록되어 있지 않아 이벤트를 놓친다.
 * sessionStorage는 지속적인 저장소라 이런 타이밍 문제가 없다 — Hero는 플래그가 남아있는
 * 한 언제 확인하든 리셋 신호를 받는다.
 */
const RESET_FLAG_KEY = 'sebi-hero-reset-pending';

export function markHeroResetPending(): void {
  try {
    sessionStorage.setItem(RESET_FLAG_KEY, '1');
  } catch {
    // sessionStorage를 쓸 수 없는 환경(프라이빗 모드 등)에서는 조용히 무시 — 리셋을 못 받아도 치명적이지 않음
  }
}

export function consumeHeroResetPending(): boolean {
  try {
    const pending = sessionStorage.getItem(RESET_FLAG_KEY) === '1';
    if (pending) sessionStorage.removeItem(RESET_FLAG_KEY);
    return pending;
  } catch {
    return false;
  }
}
