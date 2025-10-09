import { useRouter } from "next/navigation";
import { api } from "@/components/lib/api";

const  LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        const data = await api("/api/user/logout",{
            method: 'GET',
            headers: {'Content-Type':'application/json'},
            credentials: 'include'
        })

        if (data && data.message) {
            // 任意: ログアウト成功の表示なども可能
            console.log('ログアウトしました' + data.message);
            // ログイン画面に遷移
            router.push('/');
        } else {
            console.log("ログアウト失敗");
            alert('ログアウトに失敗しました。');
        }  
    };

    return (
        <button onClick={handleLogout} className="hover:text-blue-600 p-2 text-left md:text-center w-full md:w-auto cursor-pointer">
            ログアウト
        </button>
    );
}

export default  LogoutButton;