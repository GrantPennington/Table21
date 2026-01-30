import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="flex flex-col items-center gap-6 p-8 sm:p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-700 shadow-2xl max-w-2xl mx-4">
        {/* Logo */}
        <Image
          src="/primary-logo.svg"
          alt="Downcard"
          width={430}
          height={110}
          priority
          className="w-full max-w-md"
        />

        {/* Subtitle */}
        <p className="text-2xl font-medium text-gray-300 -mt-2">
          Blackjack
        </p>

        <p className="text-gray-400 text-center max-w-md">
          Free to play. No login required.
        </p>
        <div className="flex flex-col gap-4 text-center">
          <Link
            href="/play"
            className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Play Now
          </Link>
          <Link
            href="/stats"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium text-lg rounded-lg transition-colors"
          >
            My Stats
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium text-lg rounded-lg transition-colors"
          >
            Leaderboard
          </Link>
          <p className="text-sm text-gray-300">
            Dealer stands on soft 17 • Blackjack pays 3:2
          </p>
        </div>
        <div className="mt-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">Game Rules</h2>
          <ul className="text-gray-400 space-y-1 text-sm">
            <li>• 6-deck shoe</li>
            <li>• Dealer stands on soft 17</li>
            <li>• Blackjack pays 3:2</li>
            <li>• Split & double down allowed</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
