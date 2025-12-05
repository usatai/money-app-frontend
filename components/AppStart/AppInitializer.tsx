// app/AppInitializer.tsx
'use client'

import { useEffect } from 'react';

// childrenを受け取るコンポーネントを作成
export default function AppInitializer({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // アプリ起動時に一度だけCSRFトークンを取得
        const initCsrf = async () => {
            try {
                // 環境変数へのアクセス方法も修正が必要な場合があります
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/csrf`, { 
                    credentials: 'include',
                });
            } catch (error) {
                console.error('Failed to initialize CSRF token:', error);
            }
        };

        initCsrf();
    }, []);

    // children をそのまま返します
    return <>{children}</>;
}