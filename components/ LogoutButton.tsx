import { useRouter } from "next/navigation";

const  LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
  
        // JWTトークンを削除
        localStorage.removeItem('token');

        // 任意: ログアウト成功の表示なども可能
        console.log('ログアウトしました');

        // ログイン画面に遷移
        router.push('/');
    };

    return (
        <button onClick={handleLogout} className="hover:text-blue-600 p-2 text-left md:text-center w-full md:w-auto cursor-pointer">
            ログアウト
        </button>
    );
}

export default  LogoutButton;