const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// 汎用 API 関数
export async function api(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();

  // 書き込み系メソッドなら CSRF トークンをヘッダーに付与
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };

  try {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // CSRF Cookie を事前取得
        const csrfResponse = await fetch(`${BASE}/api/user/csrf`, {
          credentials: 'include',
        });

        const csrfData = await csrfResponse.json();
        const xsrfToken = csrfData.token;
        
        console.log(xsrfToken);
        if (xsrfToken) {
          headers['X-XSRF-TOKEN'] = xsrfToken;
        }
      }
    
    // メインの fetch
    console.log('[api] 送信するリクエスト:', {
        url: `${BASE}${path}`,
        method: init.method || 'GET',
        headers,
        body: init.body
    });
    
    let res = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: 'include', // Cookie 送受信
        headers,                // ヘッダーを上書きせず最後に適用
    });
    
    // 401 が返った場合に一度だけリフレッシュ → 再試行
    if (res.status === 401) {
    const refreshRes = await fetch(`${BASE}/api/user/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

    console.log("ログ" + refreshRes);

    if (refreshRes.ok) {
        res = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: 'include',
        headers,
        });
    }
    }

    // レスポンスにボディがあるかどうかをチェック
    const contentLength = res.headers.get('content-length');
    const hasContent = contentLength && parseInt(contentLength, 10) > 0;
    
    // レスポンスが成功で、かつ中身がある場合のみJSONとして解釈
    if (res.ok && hasContent) {
      return await res.json();
    }
    
    // レスポンスが成功で、中身がない場合 (ログアウトなど)
    if (res.ok && !hasContent) {
      return true; // または null や空のオブジェクト {} を返す
    }
    
    // レスポンスが失敗で、中身がある場合
    if (!res.ok && hasContent) {
      // エラーレスポンスのJSONを返す
      const errorData = await res.json();
      return Promise.reject(errorData); // エラーとして扱う
    }
    
    // レスポンスが失敗で、中身がない場合
    if (!res.ok && !hasContent) {
      // ステータスコードなどからエラーオブジェクトを生成
      return Promise.reject({ status: res.status, message: res.statusText });
    }
  } catch (e) {
    console.log("ミス" + e);
    return null;
  }
}
