const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// 汎用 API 関数
export async function api(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();

  // ヘッダー初期化
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };

  try {
    // 書き込み系メソッドなら CSRF トークンをヘッダーに付与
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // 1. /csrf を叩いて JSON でトークンを取得
        const csrfRes = await fetch(`${BASE}/api/user/csrf`, {
          credentials: 'include',
        });

        if (!csrfRes.ok) throw new Error('CSRF token fetch failed');

        const csrfData = await csrfRes.json();
        if (csrfData?.token) {
          headers['X-XSRF-TOKEN'] = csrfData.token;
        }
    }

    // 2. メインの fetch
    console.log('[api] 送信するリクエスト:', {
      url: `${BASE}${path}`,
      method: init.method || 'GET',
      headers,
      body: init.body
    });

    let res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include', // Cookie 送受信
      headers,
    });

    // 3. 401 が返った場合は refresh → 再試行
    if (res.status === 401) {
      const refreshRes = await fetch(`${BASE}/api/user/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        res = await fetch(`${BASE}${path}`, {
          ...init,
          credentials: 'include',
          headers,
        });
      }
    }

    console.log("レスポンス詳細:", {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      url: res.url
    });

    const responseClone = res.clone();
    try {
      const responseText = await responseClone.text();
      console.log("レスポンスボディ:", responseText);
    } catch (e) {
      console.log("レスポンスボディ読み取りエラー:", e);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (e) {
    console.log("ミス", e);
    return null;
  }
}
