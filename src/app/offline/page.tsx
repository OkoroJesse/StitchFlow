'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: '#f8f7fc',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-[#ede9f6] flex flex-col items-center animate-in fade-in duration-500">
        {/* Brand/Logo Section */}
        <div className="w-16 h-16 rounded-2xl bg-[#fdf2f8] flex items-center justify-center mb-6 shadow-sm border border-[#fce7f3]">
          <img 
            src="/logo.png" 
            alt="StitchFlow Logo" 
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Offline Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-400">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1625] mb-3">
          You are Offline
        </h1>
        <p className="text-sm text-[#6b7280] leading-relaxed mb-8">
          StitchFlow is currently unable to reach the servers. Please check your internet connection and try again.
        </p>

        {/* Action Button */}
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-98"
          style={{
            background: 'linear-gradient(135deg, #e91e8c, #7c3aed)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = '0.95'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = '1'
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>

        <p className="text-[11px] text-[#9ca3af] mt-5">
          Your offline changes will automatically sync once you're back online.
        </p>
      </div>
    </div>
  )
}
