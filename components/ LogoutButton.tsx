import { useRouter } from "next/navigation";

const  LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch("http://localhost:8080/api/user/logout",{
            method: 'GET',
            headers: {'Content-Type':'application/json'},
            credentials: 'include'
        })

        if (response.ok) {
            // 任意: ログアウト成功の表示なども可能
            console.log('ログアウトしました');
            // ログイン画面に遷移
            router.push('/');
        } else {
            console.log("ログアウト失敗");
        }  
    };

    return (
        <button onClick={handleLogout} className="hover:text-blue-600 p-2 text-left md:text-center w-full md:w-auto cursor-pointer">
            ログアウト
        </button>
    );
}

export default  LogoutButton;