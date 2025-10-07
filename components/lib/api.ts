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
    
    // エラーレスポンスの処理
    if (!res.ok) {
      // エラー内容がJSONで返ってくる場合はそれをthrowする
      if (hasContent) {
        throw await res.json();
      }
      // JSONがない場合はステータス情報でエラーをthrowする
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // 成功レスポンスの処理
    if (hasContent) {
      // 中身があればJSONとして解釈して返す (ログインなど)
      return await res.json();
    } else {
      // 中身がなければ成功の証として true を返す (ログアウトなど)
      return true;
    }
  } catch (e) {
    console.log("ミス" + e);
    return null;
  }
}
