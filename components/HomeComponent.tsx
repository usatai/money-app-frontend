import Link from "next/link"
import Image from "next/image"

const HomeComponent = () => {

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 focus-in-contract">
            {/* ナビゲーションバー */}
            <nav className="bg-white/80 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <Image
                            src="/images/logo.png"
                            alt="マネカン"
                            width={40}
                            height={40}
                            className="mr-2"
                            priority
                        />
                        <span className="text-2xl font-bold text-gray-800">マネカン</span>
                    </div>
                
                    <div className="flex-shrink-0">
                        <Link href="/gestLogin" className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all">
                            ゲストログインはこちら
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ヒーローセクション */}
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 focus-in-contract">
                    お金管理サービス<p>「マネカン」</p>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    あなたの財務をスマートに管理し、より良い未来を築きましょう
                </p>
                <div className="space-x-4">
                    <Link href="/signup" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg">
                        新規登録
                    </Link>
                    <Link href="/login"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg">
                        ログイン
                    </Link>
                </div>
            </div>

            {/* 特徴セクション */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            src: "/images/money-management.jpg",
                            alt: "目標設定",
                            title: "収支金額設定",
                            description: "カテゴリーごとに金額を設定でき、何に使っていて無駄使いを認識できる"
                        },
                        {
                            src: "/images/money-visualization.jpg",
                            alt: "グラフ化",
                            title: "グラフ化で可視化",
                            description: "数字だけじゃわかりずらい。なので本サービスでは数値をグラフ化し常にお金と向き合えているかを実感できる"
                        },
                        {
                            src: "/images/money-remainder.jpg",
                            alt: "通知機能",
                            title: "通知機能",
                            description: "設定した支出金額目標より使いすぎなときはリマインドしてくれて目標達成をサポートしてくれる"
                        }
                    ].map((card, index) => (
                        <div key={index} 
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
                            <div className="relative h-65">
                                <Image
                                    src={card.src}
                                    alt={card.alt}
                                    fill
                                    className="object-contain p-4"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                                <p className="text-gray-600">{card.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}

export default HomeComponent