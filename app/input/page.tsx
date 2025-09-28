"use client";

import { useRouter } from "next/navigation";
import { useState ,useEffect} from "react";
import { api } from "../lib/api"
import Navbar from "@/components/Navbar";

const InputPage = () => {
    const [form,setForm] = useState({labelName: '',type:'INCOME'});
    const [error,setError] = useState<string | null>(null);
    const [isLoading,setLoding] = useState(true);
    const router = useRouter();
    const [currentDate,setCurrentDate]= useState<string | null>(null);

    // ローディング用
    useEffect(() => {
        setLoding(false);
    },[])

    useEffect(() => {
        // ページが最初に表示された時に一度だけ実行
        const prepareCsrfCookie = async () => {
            try {
                // バックエンドにGETリクエストを送り、XSRF-TOKENクッキーをもらう
                await api('/api/user/csrf');
                console.log('✅ mainページでCSRFクッキーの準備ができました。');
                const data = localStorage.getItem('currentDate');
                setCurrentDate(data);
            } catch (error) {
                console.error('CSRFクッキーの準備に失敗しました:', error);
                // エラーハンドリング
            }
        };

        prepareCsrfCookie();
    }, []); // 空の配列[]で初回ロード時のみ実行

    const labelSet = (e:React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form,[e.target.name]:e.target.value});
    }

    const labelFormSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null);

        console.log('API実行前のcurrentDate:', currentDate);
        console.log('localStorage直接取得:', localStorage.getItem('currentDate'));

        // 送信するデータを事前に作成して確認
        const requestData = {
            label_name: form.labelName,
            type: form.type,
            currentDate: currentDate
        };
        console.log('送信するデータ:', requestData);
        console.log('JSON文字列化後:', JSON.stringify(requestData));

        try{
            const data = await api("/api/user/input", {
            method: "POST",
            body: JSON.stringify(requestData),
            });

            console.log("データ" + data);

            if (data) {
                router.push(`/main?message=${encodeURIComponent(data.message)}`);
            } else {
                if(data.errors){
                    setError(data.errors);
                } else {
                    setError("不明なエラーが発生しました");
                }
            }
        } catch (e) {
            if (e instanceof Error) {
            setError(`通信エラー: ${e.message}`);
        }
    }

    }

    if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

    return (
        <>
        <Navbar />

        <div className="min-h-screen flex items-start justify-center pt-30 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-10">収支項目の入力</h1>

                <h3 className="text-sm text-center mb-10">管理をしたい収支カテゴリーを入力してください</h3>
                
                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {Array.isArray(error) ? error.map((err, index) => (
                        <div key={index}>{err}</div>
                    )) : error}
                </div>
                )}

                <form onSubmit={labelFormSubmit} className="space-y-4">
                    <div>
                        <select 
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setForm({...form, type: e.target.value})}
                            value={form.type}
                            >
                            <option value="INCOME">収入</option>
                            <option value="EXPENDITURE">支出</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            name="labelName"
                            value={form.labelName}
                            placeholder="項目  例：食費"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={labelSet}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-5 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        登録
                    </button>

                    <button
                        onClick={() => window.location.href = '/main'}
                        type="button"
                        className="mt-2 w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        戻る
                    </button>
                </form>
            </div>
        </div>
        </>
    );
}

export default InputPage;