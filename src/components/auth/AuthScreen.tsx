'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const inputClass = "block w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
const inputStyle = { background: '#f8f7fc', border: '1.5px solid #ede9f6', color: '#1a1625' }
const inputFocusStyle = { borderColor: '#e91e8c', boxShadow: '0 0 0 3px rgba(233,30,140,0.1)' }

const FocusInput = ({ type, placeholder, value, onChange, required }: any) => (
  <input
    type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
    className={inputClass}
    style={inputStyle}
    onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
    onBlur={e => Object.assign(e.target.style, inputStyle)}
  />
)

export function AuthScreen({ initialMode }: { initialMode: 'login' | 'register' }) {
  const [mode, setMode] = useState(initialMode)
  
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regBusinessName, setRegBusinessName] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    window.history.pushState(null, '', `/${newMode}`)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) { setLoginError(error.message); setLoginLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegError(null)
    const { error } = await supabase.auth.signUp({
      email: regEmail, password: regPassword,
      options: { data: { business_name: regBusinessName } }
    })
    if (error) { setRegError(error.message); setRegLoading(false) }
    else { setRegSuccess(true); setRegLoading(false) }
  }


  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: '#f8f7fc', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="relative w-full max-w-5xl lg:h-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden flex" style={{ border: '1px solid #ede9f6', boxShadow: '0 25px 80px rgba(233,30,140,0.08), 0 8px 32px rgba(0,0,0,0.06)' }}>

        {/* ─── FORM SIDE (left on desktop, full on mobile) ─── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-7 lg:p-10 relative z-10 overflow-y-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 mb-6">
            <Image src="/logo.png" alt="StitchFlow" width={52} height={52} className="object-contain" style={{ filter: 'drop-shadow(0 2px 6px rgba(233,30,140,0.25))' }} />
            <span className="text-lg font-bold" style={{ color: '#1a1625' }}>Stitch<span style={{ color: '#e91e8c' }}>Flow</span></span>
          </Link>

          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: '#f8f7fc', border: '1px solid #ede9f6' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize"
                style={mode === m 
                  ? { background: '#e91e8c', color: 'white', boxShadow: '0 2px 8px rgba(233,30,140,0.3)' }
                  : { background: 'transparent', color: '#9ca3af' }
                }
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a1625' }}>Welcome back 👋</h2>
              <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Log in to manage your fashion workflow.</p>

              <form className="space-y-4" onSubmit={handleLogin}>
                {loginError && (
                  <div className="rounded-xl p-3 text-sm border" style={{ background: '#fdf2f8', borderColor: '#fce7f3', color: '#c4177a' }}>
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>Email Address</label>
                  <FocusInput type="email" placeholder="tailor@stitchflow.com" value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>Password</label>
                  <FocusInput type="password" placeholder="••••••••" value={loginPassword} onChange={(e: any) => setLoginPassword(e.target.value)} required />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 mt-2"
                  style={{ background: 'linear-gradient(135deg, #e91e8c, #c4177a)', boxShadow: '0 4px 15px rgba(233,30,140,0.3)' }}
                >
                  {loginLoading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>
            </div>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <div>
              {regSuccess ? (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4' }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: '#1a1625' }}>Check your email!</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    We've sent a verification link to <strong style={{ color: '#1a1625' }}>{regEmail}</strong>.
                  </p>
                  <button onClick={() => switchMode('login')} className="mt-4 text-sm font-bold" style={{ color: '#e91e8c' }}>
                    Back to Sign In →
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a1625' }}>Create Workspace 🎉</h2>
                  <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Start managing your fashion business today.</p>

                  <form className="space-y-4" onSubmit={handleRegister}>
                    {regError && (
                      <div className="rounded-xl p-3 text-sm border" style={{ background: '#fdf2f8', borderColor: '#fce7f3', color: '#c4177a' }}>
                        {regError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>Business Name</label>
                      <FocusInput type="text" placeholder="Luxe by Phavour" value={regBusinessName} onChange={(e: any) => setRegBusinessName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>Email Address</label>
                      <FocusInput type="email" placeholder="tailor@stitchflow.com" value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>Password</label>
                      <FocusInput type="password" placeholder="••••••••" value={regPassword} onChange={(e: any) => setRegPassword(e.target.value)} required />
                    </div>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 mt-2"
                      style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)', boxShadow: '0 4px 15px rgba(233,30,140,0.25)' }}
                    >
                      {regLoading ? 'Creating Workspace…' : 'Create Workspace →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* ─── VISUAL SIDE (right panel — desktop only) ─── */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 50%, #1a1625 100%)' }}>
          {/* Decorative blobs */}
          <div className="absolute w-64 h-64 rounded-full opacity-20" style={{ background: '#e91e8c', top: '-10%', right: '-15%', filter: 'blur(60px)' }} />
          <div className="absolute w-48 h-48 rounded-full opacity-15" style={{ background: '#7c3aed', bottom: '-5%', left: '-10%', filter: 'blur(50px)' }} />

          {/* Logo + Illustration */}
          <div className="relative z-10 flex flex-col items-center text-center px-10">
            {/* Logo mark */}
            <div className="mb-4 flex flex-col items-center">
              <Image src="/logo.png" alt="StitchFlow" width={110} height={110} className="object-contain" style={{ filter: 'brightness(1.15) drop-shadow(0 4px 16px rgba(233,30,140,0.5))' }} />
            </div>
            <div className="mb-6 flex justify-center">
              <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100/10 flex items-center justify-center w-[140px] sm:w-[160px] aspect-[2/3] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <img src="/mannequin.png" alt="Designer Mannequin" className="w-full h-full object-contain" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'New to StitchFlow?' : 'Welcome Back!'}
            </h2>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '260px' }}>
              {mode === 'login'
                ? 'Create your workspace and streamline your entire fashion business.'
                : 'Sign in to continue managing your clients, measurements, and orders.'}
            </p>

            {/* Stats pills */}
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {['500+ Designers', '99.9% Uptime', 'Free to Start'].map(s => (
                <span key={s} className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(233,30,140,0.2)', color: '#f9a8d4' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
