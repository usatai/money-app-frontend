'use client';
import { useRouter } from "next/navigation";
import { useState,useEffect} from "react";

const MoneyPage = () => {
    const [moneyList,setMoneyList] = useState<string[]>([]);
    const [error,setError] = useState<string | null>();
    const [isLoading,setLoding] = useState(true);
    const router = useRouter();


    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch("http://localhost:8080/api/user/check-auth",{
                credentials : 'include'
            })
            console.log(res.status);
            if(res.status !== 200){
                router.push("/");
            }else{
                setLoding(false);
            }
        }
        checkAuth();
    },[router])

    // フォームの状態管理
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        label_name: '',
        money_price: ''
    });

    // 金額のフォーマット処理
    const formatMoneyInput = (value: string) => {
        return value.replace(/,/g, '');
    };

    // フォーム送信処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try{
            const response = await fetch("http://localhost:8080/api/user/money", {
                method : 'POST',
                credentials : 'include',
                headers : { 'Content-Type': 'application/json' },
                body : JSON.stringify({
                    label_name : formData.label_name,
                    money_price : formData.money_price,
                    date : formData.date
                }),
            });

            const data = await response.json();

            if(response.ok){
                router.push("/main");
            } else {
                if(data.errors){
                    setError(data.errors);
                }
            }

        }catch (e) {
            if(e instanceof Error){
                setError(e.message);
            }
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/api/user/money",{
            method : 'GET',
            credentials : 'include',
        })
        .then((response) => {
            if(!response.ok){
                throw new Error("データの取得に失敗しました");
            }
            return response.json();
        })
        .then((data) => {
            console.log(data.userLabel);
            setMoneyList(data.userLabel);
        })
        .catch((error) => {
            setError(error.message);  // エラー処理
        });
    },[])

    if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">

                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800">金額入力</h2>
                    <p className="text-center text-gray-600">登録する日付・分類・金額を登録してください</p>

                    {/* 日付入力 */}
                    <div>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* カテゴリー選択 */}
                    <div>
                        <select
                            value={formData.label_name}
                            onChange={(e) => setFormData({...formData, label_name: e.target.value})}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>分類を選択</option>
                            {moneyList.map((money)=> {
                                return <option key={money}>{money}</option>
                            })}
                        </select>
                    </div>

                    {/* 金額入力 */}
                    <div>
                        <input
                            type="text"
                            placeholder="例: 10000"
                            value={formData.money_price}
                            onChange={(e) => setFormData({...formData, money_price: formatMoneyInput(e.target.value)})}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 登録ボタン */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        登録
                    </button>

                    {/* 戻るボタン */}
                    <button
                        type="button"
                        onClick={() => window.location.href = '/main'}
                        className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        戻る
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MoneyPage;