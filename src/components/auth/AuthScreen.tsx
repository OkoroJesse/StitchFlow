'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { normalizePlanId } from '@/lib/plans'

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
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) return
    setResendingEmail(true)
    setResendStatus(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        setResendStatus(error.message)
      } else {
        setResendStatus('Verification link sent! Check your inbox and spam folder.')
      }
    } catch (err: any) {
      setResendStatus(err?.message || 'Failed to resend verification link.')
    } finally {
      setResendingEmail(false)
    }
  }

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
      // Map common Supabase auth errors to user-friendly messages
      let friendlyError = error.message
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        friendlyError = 'Incorrect email or password. Please check your details and try again.'
      } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        friendlyError = 'Your email is not verified yet. Please check your inbox (and spam folder) for a verification link. If you did not receive it, contact support.'
      } else if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
        friendlyError = 'Too many login attempts. Please wait a few minutes before trying again.'
      } else if (error.message.includes('User not found')) {
        friendlyError = 'No account found with this email. Please create an account first.'
      }
      setLoginError(friendlyError)
      setLoginLoading(false) 
    } else {
      const params = new URLSearchParams(window.location.search)
      const rawPlan = params.get('plan')
      const targetPlan = rawPlan ? normalizePlanId(rawPlan) : null
      const redirectPath = targetPlan && targetPlan !== 'basic'
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
      // Map common Supabase auth errors to user-friendly messages
      let friendlyError = error.message
      if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        friendlyError = 'This email is already registered. Please sign in instead.'
      } else if (error.message.includes('Password should be at least')) {
        friendlyError = 'Password must be at least 6 characters long.'
      } else if (error.message.includes('Unable to validate email address')) {
        friendlyError = 'Please enter a valid email address.'
      } else if (error.message.includes('Email rate limit exceeded') || error.message.includes('rate limit')) {
        friendlyError = 'Too many registration attempts. Please wait a few minutes and try again.'
      }
      setRegError(friendlyError)
      setRegLoading(false) 
    } else if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      // User already exists but Supabase returns a fake success
      setRegError('This email is already registered. Please sign in instead.')
      setRegLoading(false)
    } else if (data?.session) {
      // Email confirmation is disabled — user is already logged in, redirect immediately
      const params = new URLSearchParams(window.location.search)
      const rawPlan = params.get('plan')
      const targetPlan = rawPlan ? normalizePlanId(rawPlan) : null
      const redirectPath = targetPlan && targetPlan !== 'basic'
        ? `/dashboard/settings?upgradeNow=${targetPlan}`
        : '/dashboard'
      router.push(redirectPath)
      router.refresh()
    } else { 
      // Email confirmation required — show check email screen
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
                  <div className="rounded-xl p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 font-medium space-y-1.5">
                    <p>{loginError}</p>
                    {(loginError.includes('not verified') || loginError.includes('not confirmed') || loginError.includes('verification')) && (
                      <div className="pt-1 space-y-1">
                        <p className="text-rose-600 font-normal">
                          Check your <strong>spam folder</strong> — the verification email may be there.
                        </p>
                        <button
                          type="button"
                          disabled={resendingEmail || !loginEmail}
                          onClick={() => handleResendVerification(loginEmail)}
                          className="text-xs font-bold text-[#4a1525] hover:underline block disabled:opacity-50"
                        >
                          {resendingEmail ? 'Sending...' : `Resend verification link to ${loginEmail || 'your email'} →`}
                        </button>
                        {resendStatus && (
                          <p className={`text-[11px] font-semibold mt-1 ${resendStatus.includes('sent') ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {resendStatus}
                          </p>
                        )}
                      </div>
                    )}
                    {loginError.includes('No account found') && (
                      <button type="button" onClick={() => switchMode('register')} className="text-[#4a1525] font-bold hover:underline">
                        Create an account →
                      </button>
                    )}
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
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-xl">
                    ✓
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Check your inbox!</h2>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    We've sent a verification link to{' '}
                    <strong className="text-stone-900">{regEmail}</strong>.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                    <p className="text-[11px] font-bold text-amber-800 mb-1">📬 Don't see the email?</p>
                    <ul className="text-[11px] text-amber-700 space-y-0.5 list-disc list-inside">
                      <li>Check your <strong>spam / junk</strong> folder</li>
                      <li>Check your <strong>promotions</strong> tab</li>
                      <li>Wait up to 5 minutes and refresh</li>
                      <li>Make sure you entered the correct email</li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Once verified, come back here and sign in with your password.
                  </p>
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      disabled={resendingEmail}
                      onClick={() => handleResendVerification(regEmail)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#4a1525] bg-[#fbf0f3] hover:bg-[#f5dce4] transition-colors disabled:opacity-50"
                    >
                      {resendingEmail ? 'Sending verification link...' : 'Resend verification email'}
                    </button>
                    {resendStatus && (
                      <p className={`text-[11px] font-semibold ${resendStatus.includes('sent') ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {resendStatus}
                      </p>
                    )}
                  </div>
                  <button onClick={() => switchMode('login')} className="mt-2 text-xs font-bold text-[#4a1525] hover:underline">
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
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#18131d] via-[#2c1b26] to-[#4a1525] p-10">
          
          {/* Subtle Ambient Background Accents */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-5">
            {/* White Logo Container Card with Glow */}
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-3.5 shadow-2xl border border-white/80 ring-4 ring-white/10 mb-1">
              <Image src="/logo.png" alt="StitchFlow" width={52} height={52} className="object-contain" />
            </div>

            {/* Atelier Tagline Badge */}
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-rose-300 uppercase px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              ATELIER &amp; BESPOKE WORKFLOW
            </span>

            {/* Main Headline */}
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight leading-snug max-w-xs">
              Fashion Workflow Operating System
            </h2>

            {/* Description */}
            <p className="text-xs text-stone-300 leading-relaxed max-w-xs font-normal">
              Bespoke body measurement profiles, fitting calendars, client CRM, and commission tracking for fashion ateliers.
            </p>

            {/* Feature Badges */}
            <div className="flex gap-2 pt-1 flex-wrap justify-center max-w-xs">
              {['Tailoring CRM', 'Measurement Engine', 'Real-Time Workflow'].map(s => (
                <span key={s} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/15 text-stone-100 border border-white/20 shadow-xs backdrop-blur-xs">
                  {s}
                </span>
              ))}
            </div>

            {/* Mini Trust Card */}
            <div className="mt-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-stone-200 font-medium">Trusted by 100+ Bespoke Tailoring Ateliers</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

