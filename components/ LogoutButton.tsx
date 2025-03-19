import { useRouter } from "next/navigation";

const  LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try{
            const response = await fetch("http://localhost:8080/logout",{
                method : 'POST',
                credentials : 'include',
            });
    
            if(response.ok){
                router.push("/");
            } else {
                console.log(response);
                console.error("ログアウトに失敗しました");
            }
        }catch(e){
            console.log("ログアウトエラー:",e);
        }
    };

    return (
        <button onClick={handleLogout} className="hover:text-blue-600 p-2 text-left md:text-center w-full md:w-auto cursor-pointer">
            ログアウト
        </button>
    );
}

export default  LogoutButton;