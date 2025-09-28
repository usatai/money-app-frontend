import { useSearchParams } from "next/navigation";
import { useState,useEffect } from 'react';


export default function SuccessMessage(){

const search = useSearchParams();
const [successMessage, setSuccessMessage] = useState<string | null>(search.get("message"));


useEffect(() => {
    if(successMessage){
        const timer = setTimeout(() => {
            setSuccessMessage(null);

            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete("message");
            window.history.replaceState(null, "", currentUrl.toString());
        },3000);

        return () => clearTimeout(timer);
    }
},[successMessage]);


  return (
        <>
            {successMessage && (
                <div className="mb-4 p-4 rounded bg-green-50 text-green-600 text-sm flex justify-between items-center">
                        {successMessage}
                        <button onClick={() => setSuccessMessage(null)} className="ml-4 text-green-400 hover:text-red-600">
                            ✖
                        </button>
                    </div>

            )}
        </>
            
    )
}