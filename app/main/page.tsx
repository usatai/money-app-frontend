'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import Navbar from '@/components/Navbar';
import { chartColors } from '@/components/ColorPalette';
import SuccessMessage from '@/components/SuccessMessage';
import ConfirmDialog from '@/components/ConfirmDialog';
import { api } from '../lib/api';

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
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [incomeAmount, setIncomeAmount] = useState<number>(0);
    const [expenditureAmount, setExpenditureAmount] = useState<number>(0);
    const [moneyNowList, setMoneyNowList] = useState<number[]>([]);
    const [moneyDate, setMoneyDate] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [selectedCategory, setSelectedCategory] = useState<'total' | 'income' | 'expense'>('income');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [barChart,setBarChart] = useState('収入');

    const handleLabelClick = (label: string) => {
        setSelectedLabel(label);
        setIsDialogOpen(true); // ダイアログを開く
    };

    const fetchDate = async (selectMonth: string,type: string) => {
        console.log("タイプ" + type);
        const q = new globalThis.URLSearchParams({ selectMonth,type }).toString();
        return await api(`/api/user/main?${q}`);
    };

    useEffect(() => {
        (async () => {
            let type = selectedCategory === 'total' ? 'TOTAL' 
                : selectedCategory === 'income' ? 'INCOME' : 'EXPENDITURE'
            
            setBarChart(selectedCategory === 'income' ? '収入金額' 
                : selectedCategory === 'expense' ? '支出金額' : '収支合計金額');
            
            try {
                const data = await fetchDate(selectMonth, type);
                console.log(data);
                console.log(data.responseType);
                if (data.responseType === "DETAIL") {
                    setLabelList(data.labelList);
                    setMoneyList(data.moneyList);
                    setMoneyNowList(data.moneyNowList);
                    setMoneyDate(data.moneyDate);
                    setUserMonthList(data.userMonthList);
                    localStorage.setItem('currentDate', data.monthDate); // これは機密ではないのでOK
                } else {
                    setIncomeAmount(data.incomeAmount);
                    setExpenditureAmount(data.expenditureAmount);
                    setTotalAmount(data.totalAmount);
                }
            } catch (e) {
                console.error('データ取得エラー:', e);
                router.push('/'); // 401でrefreshも失敗した場合はここに来る想定
            } finally {
                setIsLoading(false);
            }
        })();
    },[selectMonth,selectedCategory]);

    // 削除確認のハンドラ
    const handleConfirmDelete = async () => {
        try {
            const response = await api ('/api/user/delete',{
                method : 'POST',
                body : JSON.stringify({
                    label_name : selectedLabel,
                    currentDate: localStorage.getItem('currentDate')
                })
            })
            // 例: データから selectedLabel に一致するものをフィルタリングして状態更新
            console.log(`「${selectedLabel}」を削除しました！`);
            setIsDialogOpen(false); // ダイアログを閉じる
            setSelectedLabel(null); // 選択状態をリセット
            window.location.reload()

        } catch (e) {
            console.error('削除エラー:', e);
            router.push('/'); // 認証エラーならログインへ
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedLabel(null); // キャンセル時も選択状態をクリア
    };


    const pieChartData = labelList.map((label, index) => ({
        name: label, // ラベル名
        value: moneyList[index], // 対応する金額
    }))

    const barChartData = moneyDate.map((date,index) => ({
        date: date,
        amount: moneyNowList[index],
    }));

    const barTotalData = [{name: '月間収支',収入: incomeAmount,支出:expenditureAmount}];

    const balance =  totalAmount // 収支合計（差額）

  
    if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen bg-blue-50">

                <SuccessMessage />

                <Navbar />

                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6 flex flex-col items-center">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-center">
                            月選択
                        </label>
                        <select
                            className="shadow border rounded w-125  py-2 px-3 text-gray-700 mx-auto"
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
                            月間リアルタイム割合収支グラフ
                        </h4>
                        {selectedCategory === 'total' ? (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <h3 style={{ margin: 0 }}>収支合計額</h3>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'red', marginBottom: 20 }}>
                                    {balance.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })}
                                </p>
                            </div>
                        ) : null}
                        <div className="flex justify-center mb-6">
                            <button
                                type="button"
                                className={`
                                    px-3 py-1 rounded-l-lg text-sm font-semibold transition-colors duration-200
                                    ${selectedCategory === 'income'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }
                                `}
                                onClick={() => setSelectedCategory('income')}
                            >
                                収入
                            </button>
                            <button
                                type="button"
                                className={`
                                    px-3 py-1 rounded-rl-lg text-sm font-semibold transition-colors duration-200
                                    ${selectedCategory === 'expense'
                                        ? 'bg-red-600 text-white shadow-md' // 支出が選択されている色
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 収入が選択されていない色
                                    }
                                `}
                                onClick={() => setSelectedCategory('expense')}
                            >
                                支出
                            </button>
                            <button
                                type="button"
                                className={`
                                    px-3 py-1 rounded-r-lg text-sm font-semibold transition-colors duration-200
                                    ${selectedCategory === 'total'
                                        ? 'bg-red-600 text-white shadow-md' // 支出が選択されている色
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 収入が選択されていない色
                                    }
                                `}
                                onClick={() => setSelectedCategory('total')}
                            >
                                収支合計
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row">
                           {pieChartData.length > 0 || selectedCategory === 'total' ? (
                                <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto" style={{ height: 250 }}>
                                    <ResponsiveContainer>
                                        {selectedCategory === 'total' ? (
                                            <BarChart data={barTotalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="収入" fill="#8884d8" name="収入" />
                                                <Bar dataKey="支出" fill="#82ca9d" name="支出" />
                                            </BarChart>
                                        ) : (
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
                                                    if (payload.name !== '収支合計') {
                                                        handleLabelClick(payload.name);
                                                    } else {
                                                        // 収支合計がクリックされたが、何もしない場合
                                                        console.log("収支合計ラベルがクリックされましたが、削除は無効です。");
                                                    }
                                                } else {

                                                }
                                            }}/>
                                        </PieChart>
                                        )}
                                    </ResponsiveContainer>
                                    <ConfirmDialog
                                        isOpen={isDialogOpen}
                                        onClose={handleCloseDialog}
                                        onConfirm={handleConfirmDelete}
                                        title="確認"
                                        description={`本当に「${selectedLabel}」に関連するデータを削除しますか？`}
                                        confirmButtonText="削除する"
                                        cancelButtonText="キャンセル"
                                    />
                                </div>
                            ) : (
                            <div className="w-3/4 mx-auto h-[250px] flex items-center justify-center text-gray-500">
                                グラフデータがありません。
                            </div>
                            )}
                        </div>
                    </div>

                    {/* 棒グラフセクション */}
                    {barChartData.length > 0 && selectedCategory !== 'total' ? (
                        <div className="bg-white rounded-lg shadow-md p-6">   
                            <h4 className="text-xl font-bold text-center mb-6">
                            日別支出グラフ
                            </h4>
                            <div className="h-[300px]">
                                <ResponsiveContainer>
                                    <BarChart 
                                        data={barChartData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
                                        barCategoryGap="60%"
                                        barGap={8}
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
                                            name={barChart} // 凡例に表示される名前
                                            maxBarSize={36}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>

                            </div>
                        </div>
                    ) : (
                        null
                    )}
                </div>
            </div>
        </Suspense>
    );
}