"use client";

import { useRouter } from "next/navigation";
import { useState ,useEffect} from "react";

const InputPage = () => {
    const [form,setForm] = useState({labelName: '',type:''});
    const [error,setError] = useState<string | null>(null);
    const [isLoading,setLoding] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const currentDate = localStorage.getItem('currentDate');

    useEffect(() => {
        const checkAuth = async () => {
            // ローカル開発用
            const res = await fetch('http://localhost:8080/api/user/check-auth',{
                headers: getAuthHeaders()
            })
            console.log(res.status);
            if(res.status !== 200){
                localStorage.removeItem("token");
                router.push("/");
            }else{
                setLoding(false);
            }
        }
        checkAuth();
    },[router])

    const labelSet = (e:React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form,[e.target.name]:e.target.value});
    }

   const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const labelFormSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try{
            const response = await fetch("http://localhost:8080/api/user/input", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                label_name: form.labelName,
                type: form.type,
                currentDate: currentDate
            }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/main?message=${encodeURIComponent(data.message)}`);
            } else {
                let data = {};
                try {
                    data = await response.json();
                } catch (e) {
                    console.warn("JSON解析に失敗:", e);
                }

                if ("errors" in data && Array.isArray(data.errors)) {
                    setError((data as any).errors.join(", "));
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-10">収支項目の入力</h1>

                <h3 className="text-sm text-center mb-10">管理をしたい収支カテゴリーを入力してください</h3>
                
                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {error}
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
    );
}

export default InputPage;