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

    // Strict validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginEmail)) {
      setLoginError('Please enter a valid email address.')
      setLoginLoading(false)
      return
    }

    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters long.')
      setLoginLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) { 
      setLoginError(error.message)
      setLoginLoading(false) 
    } else {
      const params = new URLSearchParams(window.location.search)
      const plan = params.get('plan')
      const targetPlan = plan === 'basic' ? 'free' : plan
      const redirectPath = targetPlan && ['free', 'designer', 'studio'].includes(targetPlan)
        ? `/dashboard/settings?upgradeNow=${targetPlan}`
        : '/dashboard'
      router.push(redirectPath)
      router.refresh() 
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegError(null)

    // Strict validation
    if (regBusinessName.trim().length < 2) {
      setRegError('Business name must be at least 2 characters.')
      setRegLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(regEmail)) {
      setRegError('Please enter a valid email address.')
      setRegLoading(false)
      return
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.')
      setRegLoading(false)
      return
    }

    const redirectUrl = `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email: regEmail, 
      password: regPassword,
      options: { 
        data: { business_name: regBusinessName.trim() },
        emailRedirectTo: redirectUrl
      }
    })

    if (error) { 
      setRegError(error.message)
      setRegLoading(false) 
    } else if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      setRegError('This email is already registered. Please sign in instead.')
      setRegLoading(false)
    } else { 
      setRegSuccess(true)
      setRegLoading(false) 
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF8F5]">
      <div className="relative w-full max-w-4xl lg:h-[560px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex">

        {/* ─── FORM SIDE ─── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-7 lg:p-10 relative z-10 overflow-y-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="StitchFlow" width={36} height={36} className="object-contain" />
            <span className="text-xl font-serif font-bold text-stone-900">Stitch<span className="text-[#4a1525]">Flow</span></span>
          </Link>

          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 bg-[#FAF8F5] border border-stone-200">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                  mode === m 
                    ? 'bg-[#18131d] text-white shadow-xs' 
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">Welcome back</h2>
              <p className="text-xs text-stone-500 mb-6 font-medium">Log in to access your fashion workspace.</p>

              <form className="space-y-4" onSubmit={handleLogin}>
                {loginError && (
                  <div className="rounded-xl p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="tailor@stitchflow.com" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    required 
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required 
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#4a1525] hover:bg-[#18131d] transition-all disabled:opacity-60 shadow-sm mt-2"
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
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    ✓
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Check your email!</h2>
                  <p className="text-xs text-stone-500">
                    We've sent a verification link to <strong className="text-stone-900">{regEmail}</strong>.
                  </p>
                  <button onClick={() => switchMode('login')} className="mt-4 text-xs font-bold text-[#4a1525] hover:underline">
                    Back to Sign In →
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">Create Workspace</h2>
                  <p className="text-xs text-stone-500 mb-6 font-medium">Start managing your fashion studio today.</p>

                  <form className="space-y-4" onSubmit={handleRegister}>
                    {regError && (
                      <div className="rounded-xl p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                        {regError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Business / Atelier Name</label>
                      <input 
                        type="text" 
                        placeholder="Luxe by Phavour" 
                        value={regBusinessName} 
                        onChange={(e) => setRegBusinessName(e.target.value)} 
                        required 
                        className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="tailor@stitchflow.com" 
                        value={regEmail} 
                        onChange={(e) => setRegEmail(e.target.value)} 
                        required 
                        className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={regPassword} 
                        onChange={(e) => setRegPassword(e.target.value)} 
                        required 
                        className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#4a1525] hover:bg-[#18131d] transition-all disabled:opacity-60 shadow-sm mt-2"
                    >
                      {regLoading ? 'Creating Workspace…' : 'Create Workspace →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* ─── VISUAL SIDE ─── */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#18131d] via-[#2c1b26] to-[#4a1525]">
          <div className="relative z-10 flex flex-col items-center text-center px-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center p-2 mb-2 border border-white/20">
              <Image src="/logo.png" alt="StitchFlow" width={48} height={48} className="object-contain" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-white">
              Fashion Workflow Operating System
            </h2>
            <p className="text-xs text-rose-200/80 leading-relaxed max-w-xs font-light">
              Tailored measurement profiles, fitting calendars, client CRM, and commission tracking for bespoke fashion studios.
            </p>

            <div className="flex gap-2 pt-2 flex-wrap justify-center">
              {['Tailoring CRM', 'Measurement Engine', 'Real-Time Workflow'].map(s => (
                <span key={s} className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/10 text-rose-200 border border-white/10">
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

