'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
// import PieChart from '@/components/PieChart';
// import BarChart from '@/components/BarChart';
import Navbar from '@/components/Navbar';
import { chartColors } from '@/components/ColorPalette';
import SuccessMessage from '@/components/SuccessMessage';

// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Main() {
    const getCurrentYearMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }

    const [selectMonth, setSelectMonth] = useState<string>(getCurrentYearMonth);
    const [userMonthList, setUserMonthList] = useState<string[]>([]);
    const [labelList, setLabelList] = useState<string[]>([]);
    const [moneyList, setMoneyList] = useState<number[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null); // nullで初期化
    const [moneySum, setMoneySum] = useState<number>(0);
    const [moneyNowList, setMoneyNowList] = useState<number[]>([]);
    const [moneyDate, setMoneyDate] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [isIncomeState, setIsIncomeState] = useState(true);

    const handleToggle = () => {
        setIsIncomeState(prevState => !prevState);
    };

    const fetchDate = async (selectMonth: string,type: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/main?&selectMonth=${selectMonth}&type=${type}`,{
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
            const type = isIncomeState ? 'INCOME' : 'EXPENDITURE'
            const data = await fetchDate(selectMonth,type);
            if(data){
                setLabelList(data.labelList);
                setMoneyList(data.moneyList);
                console.log(moneyList);
                setMoneySum(data.moneySum);
                setMoneyNowList(data.moneyNowList);
                setMoneyDate(data.moneyDate);
                setUserMonthList(data.userMonthList);
            }
            setIsLoading(false);
        };

        fetchDataAndState();

    },[selectMonth,isIncomeState]);

    const checkSession = async () => {
        try{
            const response = await fetch('http://localhost:8080/api/user/check-session',{
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

    const pieChartData = labelList.map((label, index) => ({
        name: label, // ラベル名
        value: moneyList[index], // 対応する金額
    }))

    const barChartData = moneyDate.map((date,index) => ({
        date: date,
        amount: moneyNowList[index],
    }));

    const handleLabelClick = async (clickedLabel: string) => {
        setSelectedLabel(clickedLabel);

        if (window.confirm(`「${clickedLabel}」を本当に削除しますか？`)) {
            return;
        }
    }
  
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

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h4 className="text-xl font-bold text-center mb-6">
                            月間リアルタイム割合支出金額グラフ
                        </h4>
                        <div className="flex justify-center mb-6">
                            <button
                                type="button"
                                className={`
                                    px-3 py-1 rounded-l-lg text-sm font-semibold transition-colors duration-200
                                    ${isIncomeState
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }
                                `}
                                onClick={() => setIsIncomeState(true)}
                            >
                                収入
                            </button>
                            <button
                                type="button"
                                className={`
                                    px-3 py-1 rounded-r-lg text-sm font-semibold transition-colors duration-200
                                    ${!isIncomeState
                                        ? 'bg-red-600 text-white shadow-md' // 支出が選択されている色
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 収入が選択されていない色
                                    }
                                `}
                                onClick={() => setIsIncomeState(false)}
                            >
                                支出
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row">
                           {pieChartData.length > 0 ? (
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%" // チャートの中心X座標
                                                cy="50%" // チャートの中心Y座標 
                                                innerRadius={70} // ドーナツの内側の半径
                                                outerRadius={100} // ドーナツの外側の半径
                                                paddingAngle={1} // 各セグメント間の隙間
                                                dataKey="value" // ★重要: データオブジェクトのどのプロパティを「値」として使うか
                                                nameKey="name"  // ★重要: データオブジェクトのどのプロパティを「名前（ラベル）」として使うか
                                            >
                                                {/* ★重要: 各セグメントに色を割り当てるためにCellコンポーネントを使用 */}
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value.toLocaleString()}円`} />
                                            <Legend onClick={(e) => {
                                                const payload = e.payload as { name: string; value: number; };
                                                if (payload?.name) {
                                                    handleLabelClick(payload.name);
                                                } else {

                                                }
                                            }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                            <div className="w-3/4 mx-auto h-[250px] flex items-center justify-center text-gray-500">
                                グラフデータがありません。
                            </div>
                            )}
                        </div>
                    </div>

                    {/* 棒グラフセクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h4 className="text-xl font-bold text-center mb-6">
                            日別支出グラフ
                        </h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer>
                                <BarChart 
                                    data={barChartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
                                >
                                    {/* グリッド線: グラフの背景に点線を表示 */}
                                    <CartesianGrid strokeDasharray="3 3" />

                                    {/* X軸: 日付を表示する軸 */}
                                    <XAxis dataKey="date" /> {/* barChartData内の 'date' プロパティをX軸のラベルに使う */}

                                    {/* Y軸: 金額を表示する軸 */}
                                    <YAxis
                                        tickFormatter={(value) => value.toLocaleString()} // 目盛りの表示形式を「10,000円」のように整形
                                    />

                                    {/* ツールチップ: ホバー時に詳細情報を表示 */}
                                    <Tooltip formatter={(value) => `${value.toLocaleString()}円`} /> {/* ツールチップの表示を「金額円」に整形 */}

                                    {/* 凡例: グラフのシリーズ名を表示 */}
                                    <Legend />

                                    {/* 実際の棒グラフのデータ: 'amount'プロパティを使って棒を描画 */}
                                    <Bar
                                        dataKey="amount" // barChartData内の 'amount' プロパティを棒の高さに使う
                                        fill="rgba(241, 107, 141, 1)" // 棒の色
                                        name="支出金額" // 凡例に表示される名前
                                    />
                                </BarChart>
                            </ResponsiveContainer>

                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}