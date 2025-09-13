"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"
import { api } from "../lib/api";

const GestLogin  = () => {

    const [form,setForm] = useState({username:""});
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await api('/api/user/gestLogin',{
                method : 'POST',
                body: JSON.stringify({
                    gestLoginUserName:form.username,
                })
            })

            if (data) {
                console.log("user_id",data.userId);
                router.push(`/main`);
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
                // setError(e.message);
            }
        }
    }

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form,[e.target.name]: e.target.value});
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">ゲストログイン</h1>
        
                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
                )}
        
                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                    type="text"
                    name="username"
                    placeholder="ユーザー名"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    ログイン
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    type="button"
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    戻る
                </button>
                </form>
            </div>
        </div>

    );

}


export default GestLogin;