'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share2, Plus, Sparkles } from 'lucide-react'

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if the app is already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // Capture browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user dismissed it
      const dismissed = localStorage.getItem('stitchflow-pwa-dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if it's iOS
    const userAgent = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

    setIsIOS(isIOSDevice)

    if (isIOSDevice) {
      const dismissed = localStorage.getItem('stitchflow-pwa-dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA installation outcome:', outcome)
      setDeferredPrompt(null)
      setShowBanner(false)
    } else if (isIOS) {
      setShowIOSGuide(true)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('stitchflow-pwa-dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[380px] z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div 
        className="rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden border border-[#2d2540] flex flex-col"
        style={{
          background: 'rgba(26, 22, 37, 0.95)',
          backdropFilter: 'blur(16px)',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        {/* Subtle decorative glowing background circle */}
        <div 
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-30 blur-2xl"
          style={{ background: '#e91e8c' }}
        />

        {!showIOSGuide ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <img src="/logo.png" alt="StitchFlow Logo" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
                    Install StitchFlow
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider mt-0.5">Progressive Web App</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss} 
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 leading-relaxed mb-5">
              Add StitchFlow to your home screen for quick, offline-ready access and a seamless full-screen experience.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2.5 justify-end">
              <button 
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
              >
                Maybe Later
              </button>
              <button 
                onClick={handleInstallClick}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg active:scale-98 flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #e91e8c, #7c3aed)',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            </div>
          </>
        ) : (
          <>
            {/* iOS Guide */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-sm text-white">How to Install on iOS</h4>
              <button 
                onClick={() => setShowIOSGuide(false)} 
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-5 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-pink-400 flex-shrink-0">1</div>
                <p className="leading-relaxed">
                  Tap the <strong className="text-white">Share</strong> button in Safari (typically at the bottom of the screen).
                  <span className="inline-flex items-center justify-center bg-white/15 px-1.5 py-0.5 rounded ml-1 text-white">
                    <Share2 className="w-3 h-3" />
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-pink-400 flex-shrink-0">2</div>
                <p className="leading-relaxed">
                  Scroll down the list and select <strong className="text-white">"Add to Home Screen"</strong>.
                  <span className="inline-flex items-center justify-center bg-white/15 px-1.5 py-0.5 rounded ml-1 text-white">
                    <Plus className="w-3 h-3" />
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleDismiss}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #e91e8c, #7c3aed)',
                }}
              >
                Got It, Thanks!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
