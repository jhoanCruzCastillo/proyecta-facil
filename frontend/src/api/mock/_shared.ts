// Helpers compartidos por todos los mocks de `api/mock/*.mock.ts`: simulan la latencia de una API
// real y persisten a localStorage con el mismo patrón que usaba `book/templates_editor/src/lib/store.ts`.

export function delay(ms = 300): Promise<void> {
  const jitter = Math.floor(Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
}

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return crypto.randomUUID();
}
