"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DeletePage = () => {
    const [labelList,setLabelList] = useState([]);
    const [formData,setFormData] = useState({label_name:''});
    const [error,setError] = useState<string | null>(null);
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

    useEffect(() => {
        fetch("http://localhost:8080/api/user/money", {
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
            setLabelList(data.userLabel);
        })
        .catch((e) => {
            setError(e.message);
        })
    },[])

    const deleteSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        setError(null);

        fetch("http://localhost:8080/api/user/delete",{
            method : 'POST',
            credentials : 'include',
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify({
                label_name : formData.label_name
            })
        })
        .then((response) => {
            if(!response.ok){
                throw new Error("データの取得に失敗しました。")
            }
            return response.json();
        })
        .then((data) => {
            if(data.errors){
                setError(data.errors);
            }else{
                router.push("/main");
            }
        })
        .catch((e) => {
            setError(e.message);
        })
    }


    if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center text-gray-800">分類削除</h2>
                <p className="mt-3 text-center text-gray-600">削除する分類を選択してください</p>


                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
                )}

                <form onSubmit={deleteSubmit} className="space-y-6">
                <div>
                    <select
                        value={formData.label_name}
                        onChange={(e) => setFormData({...formData, label_name: e.target.value})}
                        className="mt-5 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                        <option value="" disabled>分類を選択</option>
                        {labelList.map((label) => {
                            return <option key={label}>{label}</option>
                        })}
                    </select>
                </div>

                <button
                type="submit"
                className="mt-5 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                 削除   
                </button>

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

export default DeletePage;