"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const [form, setForm] = useState({ username: '', email:'',password: '' });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    function getCsrfTokenFromCookie(): string | null {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    const csrfToken = getCsrfTokenFromCookie();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try{
            const response = await fetch('http://localhost:8080/api/user/signup', {
                method : 'POST',
                headers : {
                    'Content-Type':'application/json',
                    'X-XSRF-TOKEN': csrfToken || '',
                },
                credentials : 'include',
                body : JSON.stringify({
                    user_name : form.username,
                    user_email : form.email,
                    user_password : form.password,
                })
            });

            const data = await response.json();

            if(response.ok){
                router.push("/main");
            } else {
                if(data.errors && Array.isArray(data.errors)){
                    setError(data.errors.join(', '));
                }else{
                    setError("不明なエラー"); // エラーメッセージを設定
                }
                return;
            }

        }catch(e){
            if(e instanceof Error){
                setError(e.message);
            }
            
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">新規ユーザー登録</h1>
        
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

                <div>
                    <input
                    type="email"
                    name="email"
                    placeholder="メールアドレス"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>
                
                <div>
                    <input
                    type="password"
                    name="password"
                    placeholder="パスワード" 
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    新規登録
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