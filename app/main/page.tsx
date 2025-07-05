'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import Navbar from '@/components/Navbar';
import { chartColors } from '@/components/ColorPalette';
import SuccessMessage from '@/components/SuccessMessage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Main() {
    const getCurrentYearMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }

    const [selectMonth, setSelectMonth] = useState<string>(getCurrentYearMonth);
    const [userMonthList, setUserMonthList] = useState<string[]>([]);
    const [labelList, setLabelList] = useState<string[]>([]);
    const [moneyList, setMoneyList] = useState<number[]>([]);
    const [moneySum, setMoneySum] = useState<number>(0);
    const [moneyNowList, setMoneyNowList] = useState<number[]>([]);
    const [moneyDate, setMoneyDate] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchDate = async (selectMonth : string) => {
    try {
        const response = await fetch(`${apiUrl}/api/user/main?&selectMonth=${selectMonth}`,{
            credentials:'include',
        });

        if (response.status === 400) {
            router.replace('/'); // 未ログインならログイン画面へ
            return;
        }

        if (!response.ok) throw new Error('データ取得に失敗しました');
        return await response.json();

        
    }catch(error){
        console.error('データ取得エラー:', error);
        return null;
    }
};

useEffect(() => {
    const fetchDataAndState = async () => {
        const data = await fetchDate(selectMonth);
        if(data){
            setLabelList(data.labelList);
            setMoneyList(data.moneyList);
            setMoneySum(data.moneySum);
            setMoneyNowList(data.moneyNowList);
            setMoneyDate(data.moneyDate);
            setUserMonthList(data.userMonthList);
        }
        setIsLoading(false);
    };

    fetchDataAndState();

},[selectMonth]);

const checkSession = async () => {
    try{
        const response = await fetch(`${apiUrl}/api/user/check-session`,{
            credentials : 'include'
        })

        if(response.status === 401){
            console.log("セッションが切れました。ログアウトします");
            router.push("/");
        }
    }catch(e){
        console.error("セッションチェック中にエラーが発生しました",e);
    }
};

useEffect(() => {
    const interval = setInterval(checkSession,2 * 60 * 1000);
    return () => clearInterval(interval);
  },[router]);
  
  const pieChartData = {
    labels: labelList,
    datasets: [{
      data: moneyList,
      backgroundColor: chartColors,
    }]
  };

  const barChartData = {
    labels: moneyDate,
    datasets: [{
      label: '支出金額',
      data: moneyNowList,
      backgroundColor: 'rgba(241, 107, 141, 1)',
    }]
  };
  
  if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-blue-50">

            <SuccessMessage />

            <Navbar />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        月選択
                    </label>
                    <select
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        value={selectMonth}
                        onChange={(e) => 
                            setSelectMonth(e.target.value)}
                    >
                        {userMonthList.map(month => (
                        <option key={month} value={month}>{month}月</option>
                        ))}
                    </select>
                </div>

                    {/* 円グラフセクション */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h4 className="text-xl font-bold text-center mb-6">
                        月間リアルタイム割合支出金額グラフ
                    </h4>
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-5/12">
                            {labelList.map((label, index) => (
                                <p key={label} className={`text-center mb-2 ${labelList.length > 4 ? 'inline-block w-1/2' : 'block'}`}>
                                {label}: {moneyList[index]}円
                                </p>
                            ))}
                            <p className="text-center mt-4 font-bold">
                                合計：{moneySum.toLocaleString()}円
                            </p>
                        </div>
                        <div className="mt-3 md:w-7/12">
                            <div className="w-3/4 mx-auto">
                                <PieChart data={pieChartData} />
                            </div>
                        </div>
                    </div>
                </div>

                    {/* 棒グラフセクション */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-xl font-bold text-center mb-6">
                        日別支出グラフ
                    </h4>
                    <div className="h-[300px]">
                        <BarChart data={barChartData} />
                    </div>
                </div>
            </div>
        </div>
    </Suspense>
  );
}