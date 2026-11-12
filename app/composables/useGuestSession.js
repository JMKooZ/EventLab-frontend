const storageKey = (eventId) => `eventlab:guest:${eventId}`;

export const useGuestSession = () => {
  const load = (eventId) => {
    try {
      const raw = window.localStorage.getItem(storageKey(eventId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const save = (eventId, session) => {
    try {
      window.localStorage.setItem(storageKey(eventId), JSON.stringify(session));
    } catch {
      // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 저장을 건너뛴다
    }
  };

  const clear = (eventId) => {
    try {
      window.localStorage.removeItem(storageKey(eventId));
    } catch {
      // 위와 같은 이유로 무시
    }
  };

  const getToken = (eventId) => load(eventId)?.token ?? null;

  // 참여 API 응답을 저장한다.
  // 재접속 응답에는 reconnectToken이 null이므로, 이미 가진 토큰을 덮어쓰지 않도록 유지한다.
  const saveFromJoin = (eventId, joined) => {
    const existing = load(eventId);
    save(eventId, {
      token: joined.reconnectToken ?? existing?.token ?? null,
      nickname: joined.nickname,
    });
  };

  return { load, save, clear, getToken, saveFromJoin };
};
