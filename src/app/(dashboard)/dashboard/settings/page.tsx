'use client'

import { useState, useEffect } from 'react'
import { updateSubscriptionTier } from '@/actions/profile'
import { createClient } from '@/lib/supabase/client'
import {
  Settings as SettingsIcon,
  Check,
  Zap,
  Crown,
  Building2,
  Users,
  Briefcase,
  AlertCircle,
  Loader2,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Star,
  Infinity as InfinityIcon,
  LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type Tier = 'free' | 'designer' | 'studio'

interface Profile {
  business_name: string | null
  subscription_tier: string
  email?: string
}

interface UsageStats {
  clients: number
  activeJobs: number
}

const PLANS = [
  {
    id: 'free' as Tier,
    name: 'Basic',
    naira: '₦0',
    period: '/mo',
    tagline: 'Get started at no cost',
    icon: Zap,
    highlight: false,
    limits: { clients: 5, jobs: 3 },
    features: [
      '5 clients',
      '3 active orders',
      'Invoicing & payments',
      'Client review links',
      'Body measurements',
    ],
  },
  {
    id: 'designer' as Tier,
    name: 'Designer Pro',
    naira: '₦7,000',
    period: '/mo',
    tagline: 'For growing fashion businesses',
    icon: Crown,
    highlight: true,
    limits: { clients: Infinity, jobs: Infinity },
    features: [
      'Unlimited clients',
      'Unlimited orders',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'All Basic features',
    ],
  },
  {
    id: 'studio' as Tier,
    name: 'Fashion Studio',
    naira: '₦25,000',
    period: '/mo',
    tagline: 'For multi-designer studios',
    icon: Building2,
    highlight: false,
    limits: { clients: Infinity, jobs: Infinity },
    features: [
      'Everything in Pro',
      'Multi-designer access',
      'White-label branding',
      'API access',
      'Dedicated account manager',
    ],
  },
]

// Paystack payment integration helper
async function initiatePaystackPayment(tier: Tier, email: string, businessName: string): Promise<boolean> {
  const amounts: Record<Tier, number> = {
    free: 0,
    designer: 700000,  // ₦7,000 in kobo
    studio: 2500000,   // ₦25,000 in kobo
  }
  const amount = amounts[tier]
  if (amount === 0) return true // Downgrade to free — no payment needed

  // Paystack Inline — if key is not configured, fall back to direct upgrade (dev mode)
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  if (!paystackKey) {
    // Dev/demo mode: upgrade directly without payment
    return true
  }

  return new Promise((resolve) => {
    const handler = (window as any).PaystackPop?.setup({
      key: paystackKey,
      email,
      amount,
      currency: 'NGN',
      metadata: {
        custom_fields: [
          { display_name: 'Business', variable_name: 'business', value: businessName },
          { display_name: 'Plan', variable_name: 'plan', value: tier },
        ],
      },
      callback: () => resolve(true),
      onClose: () => resolve(false),
    })
    if (handler) {
      handler.openIframe()
    } else {
      // Paystack not loaded — allow upgrade in demo mode
      resolve(true)
    }
  })
}

export default function SettingsPage() {
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [usage, setUsage]           = useState<UsageStats>({ clients: 0, activeJobs: 0 })
  const [loading, setLoading]       = useState(true)
  const [upgrading, setUpgrading]   = useState<Tier | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [userEmail, setUserEmail]   = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      const [{ data: profileData }, { count: clientCount }, { count: jobCount }] = await Promise.all([
        supabase.from('profiles').select('business_name, subscription_tier').eq('id', user.id).single(),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', user.id),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', user.id).neq('status', 'delivered'),
      ])

      if (profileData) setProfile(profileData as Profile)
      setUsage({ clients: clientCount || 0, activeJobs: jobCount || 0 })
      setLoading(false)
    }
    load()
  }, [])

  const handleUpgrade = async (tier: Tier) => {
    if (!profile) return
    setUpgrading(tier)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // For paid upgrades, run Paystack payment first
      if (tier !== 'free') {
        const paid = await initiatePaystackPayment(tier, userEmail, profile.business_name || 'StitchFlow Business')
        if (!paid) {
          setUpgrading(null)
          setErrorMsg('Payment was cancelled. Your plan was not changed.')
          return
        }
      }

      // Payment successful (or free downgrade) — update the DB
      await updateSubscriptionTier(tier)
      setProfile(prev => prev ? { ...prev, subscription_tier: tier } : prev)
      const planName = PLANS.find(p => p.id === tier)?.name
      setSuccessMsg(
        tier === 'free'
          ? 'You have downgraded to the Basic plan.'
          : `🎉 Welcome to ${planName}! Your workspace has been upgraded.`
      )
      router.refresh()
    } catch {
      setErrorMsg('Failed to update your plan. Please try again or contact support.')
    } finally {
      setUpgrading(null)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentTier   = (profile?.subscription_tier || 'free') as Tier
  const currentPlan   = PLANS.find(p => p.id === currentTier) || PLANS[0]
  const clientLimit   = currentTier === 'free' ? 5 : Infinity
  const jobLimit      = currentTier === 'free' ? 3 : Infinity
  const clientPct     = clientLimit === Infinity ? 0 : Math.min((usage.clients / clientLimit) * 100, 100)
  const jobPct        = jobLimit === Infinity ? 0 : Math.min((usage.activeJobs / jobLimit) * 100, 100)
  const nearClientCap = currentTier === 'free' && usage.clients >= 4
  const nearJobCap    = currentTier === 'free' && usage.activeJobs >= 2

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading workspace settings…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-700 max-w-4xl pb-16">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.08)' }}>
            <SettingsIcon className="w-6 h-6 text-[#e91e8c]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1e1b2e] tracking-tight">Studio Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your workspace, plan &amp; billing</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-semibold">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {/* Limit Warning */}
      {(nearClientCap || nearJobCap) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-bold">You&apos;re approaching your plan limits</p>
            <p className="font-medium mt-0.5 text-amber-700/80">
              {nearClientCap && `${usage.clients}/5 clients used. `}
              {nearJobCap && `${usage.activeJobs}/3 active orders used. `}
              Upgrade to Designer Pro for unlimited access.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan + Usage */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-7 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(233,30,140,0.05)' }} />
        <div className="relative z-10 space-y-6">

          {/* Plan header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Current Plan</p>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-[#1e1b2e]">{currentPlan.name}</h2>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#e91e8c] text-white uppercase tracking-widest">
                  Active
                </span>
              </div>
              <p className="text-[#e91e8c] font-black mt-1 text-lg">{currentPlan.naira}<span className="text-sm font-semibold text-gray-400">{currentPlan.period}</span></p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: currentTier === 'designer' ? 'rgba(233,30,140,0.1)' : 'rgba(124,58,237,0.08)' }}>
              <currentPlan.icon className="w-7 h-7" style={{ color: currentTier === 'designer' ? '#e91e8c' : '#7c3aed' }} />
            </div>
          </div>

          {/* Business info */}
          {profile?.business_name && (
            <div className="flex items-center gap-3 p-4 bg-[#FAFAF8] rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#1e1b2e] flex items-center justify-center text-[#e91e8c] font-black text-lg flex-shrink-0">
                {profile.business_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[#1e1b2e]">{profile.business_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>
              </div>
            </div>
          )}

          {/* Usage meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAFAF8] rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#e91e8c]" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Clients</span>
                </div>
                <span className="text-sm font-black text-[#1e1b2e]">
                  {usage.clients}{clientLimit !== Infinity ? ` / ${clientLimit}` : ' / ∞'}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: clientLimit === Infinity ? '30%' : `${clientPct}%`,
                    background: clientPct >= 80 ? '#ef4444' : clientPct >= 60 ? '#e91e8c' : '#7c3aed',
                  }}
                />
              </div>
              {clientLimit === Infinity && (
                <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  <InfinityIcon className="w-3 h-3" /> Unlimited on {currentPlan.name}
                </p>
              )}
            </div>

            <div className="bg-[#FAFAF8] rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Orders</span>
                </div>
                <span className="text-sm font-black text-[#1e1b2e]">
                  {usage.activeJobs}{jobLimit !== Infinity ? ` / ${jobLimit}` : ' / ∞'}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: jobLimit === Infinity ? '30%' : `${jobPct}%`,
                    background: jobPct >= 80 ? '#ef4444' : jobPct >= 60 ? '#e91e8c' : '#7c3aed',
                  }}
                />
              </div>
              {jobLimit === Infinity && (
                <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  <InfinityIcon className="w-3 h-3" /> Unlimited on {currentPlan.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Switcher */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-black text-[#1e1b2e]">Change Your Plan</h3>
          <p className="text-sm text-gray-500 mt-1">All prices in Nigerian Naira (₦). Upgrades take effect immediately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentTier
            const isUpgrading   = upgrading === plan.id
            const Icon          = plan.icon
            const isDowngrade   = PLANS.indexOf(plan) < PLANS.indexOf(currentPlan)

            return (
              <div
                key={plan.id}
                className={`relative rounded-[2rem] border-2 p-6 transition-all flex flex-col ${
                  isCurrentPlan
                    ? 'border-[#e91e8c] shadow-lg shadow-[#e91e8c]/10'
                    : plan.highlight
                    ? 'border-gray-200 hover:border-[#e91e8c]/40'
                    : 'border-gray-100 hover:border-gray-200'
                } ${plan.highlight && !isCurrentPlan ? 'bg-white' : 'bg-white'}`}
              >
                {/* Badges */}
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#e91e8c] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                      Current Plan
                    </span>
                  </div>
                )}
                {plan.highlight && !isCurrentPlan && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1e1b2e] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isCurrentPlan ? 'bg-[#e91e8c]/10' : plan.highlight ? 'bg-purple-50' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${isCurrentPlan ? 'text-[#e91e8c]' : plan.highlight ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.name}</p>
                <div className="flex items-end gap-1 mt-1 mb-1">
                  <span className="text-2xl font-black text-[#1e1b2e]">{plan.naira}</span>
                  <span className="text-sm text-gray-400 font-semibold mb-0.5">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">{plan.tagline}</p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => !isCurrentPlan && !isUpgrading && handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || upgrading !== null}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-[#e91e8c]/10 text-[#e91e8c] cursor-default'
                      : plan.highlight
                      ? 'bg-[#e91e8c] text-white hover:bg-[#c4177a] shadow-lg shadow-[#e91e8c]/25'
                      : isDowngrade
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-[#1e1b2e] text-white hover:bg-[#2d2540]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active Plan
                    </>
                  ) : isDowngrade ? (
                    'Switch to Basic'
                  ) : (
                    <>
                      {plan.naira === '₦0' ? 'Switch to Basic' : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Upgrade — {plan.naira}/mo
                        </>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Payment trust badge */}
                {!isCurrentPlan && plan.id !== 'free' && (
                  <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Secured by Paystack
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison Note */}
      <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-7 shadow-sm">
        <h3 className="text-base font-black text-[#1e1b2e] mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          What&apos;s included in each plan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature</th>
                <th className="text-center py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Basic</th>
                <th className="text-center py-3 text-[10px] font-black text-[#e91e8c] uppercase tracking-widest">Designer Pro</th>
                <th className="text-center py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['Clients', '5', '∞', '∞'],
                ['Active Orders', '3', '∞', '∞'],
                ['Invoicing & Payments', '✓', '✓', '✓'],
                ['Client Review Links', '✓', '✓', '✓'],
                ['Body Measurements', '✓', '✓', '✓'],
                ['Advanced Analytics', '—', '✓', '✓'],
                ['Priority Support', '—', '✓', '✓'],
                ['Multi-Designer Access', '—', '—', '✓'],
                ['White-Label Branding', '—', '—', '✓'],
              ].map(([feature, basic, designer, studio]) => (
                <tr key={feature}>
                  <td className="py-3.5 font-semibold text-gray-700">{feature}</td>
                  <td className="py-3.5 text-center font-bold text-gray-500">{basic}</td>
                  <td className="py-3.5 text-center font-bold text-[#e91e8c]">{designer}</td>
                  <td className="py-3.5 text-center font-bold text-gray-500">{studio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Logout */}
      <div className="sm:hidden">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-red-500 border border-red-100 bg-red-50 w-full justify-center"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Workspace
        </button>
      </div>
    </div>
  )
}
