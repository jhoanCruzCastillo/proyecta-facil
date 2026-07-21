// Helper compartido por todos los `api/http/*.http.ts`: fetch contra /api/* con la cookie de sesión
// (mismo origen gracias al proxy de Vite, ver vite.config.ts) y manejo uniforme de errores JSON.

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Error ${res.status} en /api/${path}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
