'use client';
import { useRouter } from "next/navigation";
import { useState,useEffect, Fragment} from "react";
import { Listbox, Transition, Popover } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { api } from "@/components/lib/api";
import Navbar from "@/components/layout/Navbar";
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import 'react-day-picker/dist/style.css'; 


const MoneyPage = () => {
    const [moneyList,setMoneyList] = useState<string[]>([]);
    const [error,setError] = useState<string | null>();
    const [isLoading,setLoding] = useState(true);
    const [currentMonthDate, setCurrentMonthDate] = useState<number>(new Date().getMonth() + 1);
    const router = useRouter();
    const options = [
        { value: 'INCOME', label: '収入' },
        { value: 'EXPENDITURE', label: '支出' }
    ];

    // フォームの状態管理
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], 
        incomeExpenditureType: 'INCOME',
        label_name: '',
        money_price: ''
    });

    // 現在の日時
    const nowDate = new Date().toISOString().slice(0,10);

    useEffect(() => {
        const currentDate = localStorage.getItem('currentDate');
        if (currentDate) {
            const month = currentDate.split("-")[1];
            setCurrentMonthDate(parseInt(month, 10));
        }
    },[])

    // 金額のフォーマット処理
    const formatMoneyInput = (value: string) => {
        return value.replace(/,/g, '');
    };

    useEffect(() => {
        const type = formData.incomeExpenditureType;
        console.log(currentMonthDate);
        console.log(type);
        const params = new globalThis.URLSearchParams({ 
            type,
            nowDate,
            currentMonth: String(currentMonthDate)
        }).toString();

        api(`/api/user/money?${params}`)
            .then((data) => {
                setLoding(false);
                setMoneyList(data.userLabel);
            })
            .catch((error) => {
                setLoding(false);
                setError(error.message);
                alert("ユーザー管理タイムアウトのためログアウトします。")
                router.push("/");
            });
        },[formData.incomeExpenditureType,currentMonthDate])

    // フォーム送信処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try{
            const data = await api('/api/user/money',{
                method : 'POST',
                body : JSON.stringify({
                    date : formData.date,
                    incomeExpenditureType: formData.incomeExpenditureType,
                    label_name : formData.label_name,
                    money_price : formData.money_price,
                }),
            });

            if(data){
                router.push("/main");
            } else {
                if(data.errors){
                    setError(data.errors);
                }
                router.push("/");
            }
        }catch (e) {
            if(e instanceof Error){
                setError(e.message);
            }
            router.push("/");
        }
    };

    if (isLoading) return <p className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>Loading...</p>;

    return (
        <>
        <Navbar />
        <div className="min-h-screen flex items-start pt-20 justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">

                {error && (
                <div className="mb-4 p-4 rounded bg-red-50 text-red-600 text-sm">
                    {Array.isArray(error) ? error.map((err, index) => (
                        <div key={index}>{err}</div>
                    )) : error}
                </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800">金額入力</h2>
                    <p className="text-center text-gray-600 text-sm">登録する日付・分類・金額を登録してください</p>

                    {/* 日付入力 */}
                    <div>
                        <Popover className="relative">
                            {/* カレンダーを開くためのボタン */}
                            <Popover.Button className="w-full flex items-center justify-between px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <span>
                                    {/* formData.dateがあればフォーマットして表示、なければプレースホルダー */}
                                    {formData.date ? format(new Date(formData.date), 'yyyy年M月d日') : '日付を選択'}
                                </span>
                                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                            </Popover.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                {/* カレンダー本体 */}
                                <Popover.Panel className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg">
                                    <DayPicker
                                        mode="single" // 単一の日付を選択するモード
                                        selected={formData.date ? new Date(formData.date) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                            // 選択された日付を 'YYYY-MM-DD' 形式の文字列に変換してstateを更新
                                            setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
                                            }
                                        }}
                                        locale={ja} // カレンダーを日本語表示にする
                                        initialFocus
                                    />
                                </Popover.Panel>
                            </Transition>
                        </Popover>
                    </div>

                    {/* 収支区別 */}
                    <div>
                        <Listbox
                            value={formData.incomeExpenditureType}
                            onChange={(value) => setFormData({...formData,incomeExpenditureType: value} )}                        
                            >
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-default rounded border bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75">
                                    <span className="block truncate text-gray-700">
                                        {options.find(option => option.value === formData.incomeExpenditureType)?.label}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                               </Listbox.Button>
                        
                               <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                    {options.map((option) => (
                                        <Listbox.Option
                                        key={option.value}
                                        value={option.value}
                                        className={({ active }) =>
                                            // マウスホバー時(active)に背景色を変えるだけのシンプルなスタイル
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                            }`
                                        }
                                        >
                                        {({ selected }) => (
                                            <>
                                            <span
                                                className={`block truncate ${
                                                // selectedなら太字に、そうでなければ通常の太さにする
                                                selected ? 'font-medium' : 'font-normal'
                                                }`}
                                            >
                                                {option.label}
                                            </span>
                                            {/* selectedならチェックマークを表示する */}
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                            </>
                                        )}
                                        </Listbox.Option>
                                    ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* カテゴリー選択 */}
                    <div>
                        <Listbox 
                            value={formData.label_name}
                            onChange={(value) => setFormData({...formData, label_name: value})}
                        >
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-default rounded border bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75">
                                    <span className="block truncate text-gray-700">
                                        {formData.label_name || 'カテゴリーを選択'}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>

                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                    <Listbox.Option
                                        key="placeholder"
                                        value="" // 空の値を設定
                                        className={({ active }) =>
                                        `relative cursor-default select-none py-2 px-4 ${
                                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                        }`
                                        }
                                        disabled
                                    >
                                        カテゴリーを選択
                                    </Listbox.Option>
                                    {moneyList.map((money) => (
                                        <Listbox.Option
                                        key={money}
                                        value={money}
                                        className={({ active }) =>
                                            // マウスホバー時(active)に背景色を変えるだけのシンプルなスタイル
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                            }`
                                        }
                                        >
                                        {({ selected }) => (
                                            <>
                                            <span
                                                className={`block truncate ${
                                                // selectedなら太字に、そうでなければ通常の太さにする
                                                selected ? 'font-medium' : 'font-normal'
                                                }`}
                                            >
                                                {money}
                                            </span>
                                            {/* selectedならチェックマークを表示する */}
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                            </>
                                        )}
                                        </Listbox.Option>
                                    ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>

                    {/* 金額入力 */}
                    <div>
                        <input
                            type="text"
                            placeholder="例: 10000"
                            value={formData.money_price}
                            onChange={(e) => setFormData({...formData, money_price: formatMoneyInput(e.target.value)})}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="pt-2 flex flex-col items-center gap-4">
                        {/* 登録ボタン */}
                        <button
                            type="submit"
                            className="w-3/4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            登録
                        </button>

                        {/* 戻るボタン */}
                        <button
                            type="button"
                            onClick={() => window.location.href = '/main'}
                            className="w-3/4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            戻る
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
}

export default MoneyPage;