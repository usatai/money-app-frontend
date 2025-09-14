const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let accessToken = '';

/**
 * JWT をセットする
 */
export function setAccessToken(token: string) {
    accessToken = token;
}

/**
 * 汎用 API 関数 (JWT 認証対応)
 */
export async function api(path: string, init: RequestInit = {}) {
  // ヘッダー初期化
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    ...(init.headers as Record<string, string> || {}),
  };

  try {
    // メインの fetch
    console.log('[api] 送信するリクエスト:', {
      url: `${BASE}${path}`,
      method: init.method || 'GET',
      headers,
      body: init.body
    });

    let res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
    });

    // 401 が返った場合は refresh → 再試行
    if (res.status === 401) {
      const refreshRes = await fetch(`${BASE}/api/user/refresh`, {
        method: 'POST',
        headers,
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.accessToken) {
          accessToken = refreshData.accessToken;
          headers['Authorization'] = `Bearer ${accessToken}`;

          res = await fetch(`${BASE}${path}`, {
            ...init,
            headers,
          });
        }
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
    console.log("API エラー", e);
    return null;
  }
}
