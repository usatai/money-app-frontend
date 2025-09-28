"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"
import { api } from "@/components/lib/api";

const GoalExpenditure  = () => {

    const [form,setForm] = useState({expenditure:""});
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await api('/api/user/goal_expenditure',{
                method : 'POST',
                body: JSON.stringify({
                    goal_expenditure:form.expenditure,
                })
            })

            if (data.userId) {
                // 目標設定完了後、メインページにリダイレクト
                router.push('/main');
            }else{
                if(data.errors && Array.isArray(data.errors)){
                    setError(data.errors.join(', '));
                }else{
                    setError("不明なエラー"); // エラーメッセージを設定
                }
                return;
            }

        } catch (e) {
            if(e instanceof Error){
                setError(e.message);
            }
        }
    }

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form,[e.target.name]: e.target.value});
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">支出目標額登録</h1>

                <div className="relative mb-4">
                    <div className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg shadow-sm">
                    <p className="text- text-center">今月の支出額を設定しよう。</p>
                    <p className="text-center text-sm">設定金額に対して支出のペースが早かったら教えるよ</p>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0
                    border-l-[10px] border-l-transparent
                    border-t-[10px] border-t-blue-100
                    border-r-[10px] border-r-transparent">
                    </div>
                </div>
        
                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {Array.isArray(error) ? error.map((err, index) => (
                        <div key={index}>{err}</div>
                    )) : error}
                </div>
                )}
        
                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                    type="text"
                    name="expenditure"
                    placeholder="例：10000"
                    value={form.expenditure}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    目標設定
                </button>

                </form>
            </div>
        </div>

    );

}


export default GoalExpenditure;