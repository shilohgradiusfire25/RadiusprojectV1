export const storage = {
  get<T>(k: string, fallback: T): T { const raw=localStorage.getItem(k); return raw?JSON.parse(raw):fallback; },
  set<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }
};
