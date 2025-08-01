import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import LogoutButton from './ LogoutButton';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-100 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="#" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="マネカン"
              width={30}
              height={30}
              className="mr-2"
            />
            <span className="font-bold text-xl">マネカン</span>
          </Link>

          {/* ハンバーガーメニューボタン */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* デスクトップメニュー */}
          <div className="hidden md:ml-6 md:block">
            <div className="flex space-x-4">
              <Link href="/main" className="hover:text-blue-600 p-2">グラフ画面</Link>
              <Link href="/input" className="hover:text-blue-600 p-2">収支カテゴリー登録</Link>
              <Link href="/money" className="hover:text-blue-600 p-2">収支金額登録</Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
          <div className="flex flex-col space-y-2">
            <Link href="/main" className="hover:text-blue-600 p-2">グラフ画面</Link>
            <Link href="/input" className="hover:text-blue-600 p-2">収支カテゴリー登録</Link>
            <Link href="/money" className="hover:text-blue-600 p-2">収支金額登録</Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 