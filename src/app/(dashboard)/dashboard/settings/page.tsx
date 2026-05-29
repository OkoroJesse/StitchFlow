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
} from 'lucide-react'

type Tier = 'free' | 'designer' | 'studio'

interface Profile {
  business_name: string | null
  subscription_tier: string
}

interface UsageStats {
  clients: number
  activeJobs: number
}

const PLANS = [
  {
    id: 'free' as Tier,
    name: 'Basic',
    price: '₦3,000/mo',
    icon: Zap,
    color: 'border-gray-200 bg-white',
    iconBg: 'bg-gray-100 text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-700',
    limits: { clients: 5, jobs: 3 },
    features: ['5 clients', '3 active projects', 'Basic invoicing', 'Client review links'],
  },
  {
    id: 'designer' as Tier,
    name: 'Designer Pro',
    price: '₦7,000/mo',
    icon: Crown,
    color: 'border-pink-400 bg-[#1e1b2e]',
    iconBg: 'bg-pink-500/20 text-pink-400',
    badgeColor: 'bg-pink-500 text-gray-900',
    limits: { clients: Infinity, jobs: Infinity },
    features: ['Unlimited clients', 'Unlimited projects', 'Advanced analytics', 'Custom branding', 'Priority support'],
  },
  {
    id: 'studio' as Tier,
    name: 'Fashion Studio',
    price: '₦25,000/mo',
    icon: Building2,
    color: 'border-gray-200 bg-white',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badgeColor: 'bg-[#1e1b2e] text-gray-900',
    limits: { clients: Infinity, jobs: Infinity },
    features: ['Everything in Pro', 'Multi-designer access', 'White-label branding', 'API access', 'Dedicated support'],
  },
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usage, setUsage] = useState<UsageStats>({ clients: 0, activeJobs: 0 })
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<Tier | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
    setUpgrading(tier)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await updateSubscriptionTier(tier)
      setProfile(prev => prev ? { ...prev, subscription_tier: tier } : prev)
      const planName = PLANS.find(p => p.id === tier)?.name
      setSuccessMsg(`You are now on the ${planName} plan!`)
    } catch {
      setErrorMsg('Failed to update plan. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  const currentTier = (profile?.subscription_tier || 'free') as Tier
  const currentPlan = PLANS.find(p => p.id === currentTier) || PLANS[0]

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
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-700 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Studio Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your workspace, plan, and billing</p>
        </div>
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold">
          <Check className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[80px]" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-900">{currentPlan.name}</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPlan.badgeColor}`}>
                  Active
                </span>
              </div>
              <p className="text-pink-400 font-bold mt-1">{currentPlan.price}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${currentPlan.iconBg}`}>
              <currentPlan.icon className="w-7 h-7" />
            </div>
          </div>

          {/* Usage Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Clients meter */}
            <div className="bg-[#FAFAF8] rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Clients Onboarded</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-black text-gray-900">{usage.clients}</span>
                <span className="text-sm text-gray-500 font-bold">
                  {currentTier === 'free' ? `/ 5` : '/ ∞'}
                </span>
              </div>
              {currentTier === 'free' && (
                <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${usage.clients >= 5 ? 'bg-red-500' : usage.clients >= 4 ? 'bg-pink-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((usage.clients / 5) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Active Jobs meter */}
            <div className="bg-[#FAFAF8] rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Projects</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-black text-gray-900">{usage.activeJobs}</span>
                <span className="text-sm text-gray-500 font-bold">
                  {currentTier === 'free' ? `/ 3` : '/ ∞'}
                </span>
              </div>
              {currentTier === 'free' && (
                <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${usage.activeJobs >= 3 ? 'bg-red-500' : usage.activeJobs >= 2 ? 'bg-pink-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min((usage.activeJobs / 3) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Switcher */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-2">Change Plan</h3>
        <p className="text-sm text-gray-500 mb-6">Upgrade or downgrade your workspace at any time. All prices in Nigerian Naira (₦).</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentTier
            const isUpgrading = upgrading === plan.id
            const Icon = plan.icon

            return (
              <div
                key={plan.id}
                className={`relative rounded-[2rem] border-2 p-5 sm:p-6 transition-all ${
                  isCurrentPlan
                    ? plan.id === 'designer'
                      ? 'border-pink-500 bg-[#1e1b2e]'
                      : 'border-pink-500/50 bg-white'
                    : plan.id === 'designer'
                    ? 'border-gray-200 bg-white hover:border-slate-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-pink-500 text-gray-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${plan.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="mb-1">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{plan.name}</span>
                </div>
                <div className="text-xl font-black text-gray-900 mb-4">{plan.price}</div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || isUpgrading !== null}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-pink-500/20 text-pink-400 cursor-default'
                      : plan.id === 'designer'
                      ? 'bg-pink-500 text-gray-900 hover:bg-pink-400 shadow-lg shadow-pink-500/20'
                      : 'bg-[#2d2540] text-white hover:bg-[#3d3356]'
                  } disabled:opacity-60`}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Switching…
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active Plan
                    </>
                  ) : (
                    `Switch to ${plan.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Business Profile info */}
      {profile?.business_name && (
        <div className="bg-white border border-gray-200 rounded-[2rem] p-6 sm:p-6">
          <h3 className="text-base font-black text-gray-900 mb-1">Business Profile</h3>
          <p className="text-sm text-gray-500 mb-5">Your workspace identity used across StitchFlow.</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e1b2e]/20 flex items-center justify-center border border-pink-200">
              <span className="text-xl font-black text-pink-600">
                {profile.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{profile.business_name}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{currentPlan.name} workspace</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
