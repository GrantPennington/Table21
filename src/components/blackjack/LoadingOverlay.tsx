'use client';

import { useBlackjackStore } from '@/store/blackjackStore';

export function LoadingOverlay() {
  const { identityLoading } = useBlackjackStore();

  if (!identityLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-green-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-400/30 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-400 rounded-full border-t-transparent animate-spin" />
        </div>

        {/* Loading text */}
        <div className="text-xl font-medium text-green-400">Loading game...</div>

        {/* Subtle pulsing dots */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
