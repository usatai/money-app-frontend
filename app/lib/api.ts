const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function api(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };

  // CSRFを有効化しているなら、書き込み系でヘッダ付与
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;
  }

  // 1回目の呼び出し
  let res = await fetch(`${BASE}${path}`, {
    credentials: 'include',   // ← Cookie送受信
    headers,
    ...init,
  });

  // 401なら1度だけリフレッシュ→再試行
  if (res.status === 401) {
    const refreshed = await fetch(`${BASE}/api/user/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        headers,
        ...init,
      });
    }
  }

  if (!res.ok) {
    // エラー本文のJSONがなくても落ちないように
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  // JSONがないケースも考慮
  try { return await res.json(); } catch { return null; }
}

function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))?.split('=')[1] ?? '';
}
