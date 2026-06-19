'use client'

import { useState, useEffect, useRef } from 'react'
import { updateSubscriptionTier, updateProfile } from '@/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { getSignedUrlClient, uploadImageClient } from '@/lib/supabase/storage-client'
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
  Camera,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type Tier = 'free' | 'designer' | 'studio'

interface Profile {
  business_name: string | null
  subscription_tier: string
  logo_url: string | null
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
    limits: { clients: 25, jobs: 20 },
    features: [
      'Up to 25 clients',
      'Up to 20 active orders',
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
      'Unlimited clients & orders',
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

  // Profile management states
  const [editingName, setEditingName] = useState('')
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      const [{ data: profileData }, { count: clientCount }, { count: jobCount }] = await Promise.all([
        supabase.from('profiles').select('business_name, subscription_tier, logo_url').eq('id', user.id).single(),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', user.id),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', user.id).neq('status', 'delivered'),
      ])

      if (profileData) {
        setProfile(profileData as Profile)
        setEditingName(profileData.business_name || '')
        if (profileData.logo_url) {
          try {
            const signed = await getSignedUrlClient(profileData.logo_url)
            setResolvedLogoUrl(signed)
          } catch (err) {
            console.error('Error resolving logo URL:', err)
          }
        }
      }
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSavingProfile(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const updated = await updateProfile({
        business_name: editingName,
        logo_url: profile.logo_url
      })
      setProfile(prev => prev ? { ...prev, business_name: updated.business_name } : prev)
      setSuccessMsg('🎉 Workspace settings updated successfully!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingLogo(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const storagePath = `logos/${userEmail}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const uploadedPath = await uploadImageClient(file, storagePath)

      const updated = await updateProfile({
        business_name: editingName || profile.business_name || 'My Studio',
        logo_url: uploadedPath
      })

      setProfile(prev => prev ? { ...prev, logo_url: updated.logo_url } : prev)

      const signed = await getSignedUrlClient(updated.logo_url!)
      setResolvedLogoUrl(signed)

      setSuccessMsg('🎉 Profile image uploaded successfully!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Failed to upload image. Make sure it is an image and try again.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoRemove = async () => {
    if (!profile) return
    setUploadingLogo(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const updated = await updateProfile({
        business_name: editingName || profile.business_name || 'My Studio',
        logo_url: null
      })

      setProfile(prev => prev ? { ...prev, logo_url: null } : prev)
      setResolvedLogoUrl(null)
      setSuccessMsg('Profile image removed successfully.')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove image.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentTier   = (profile?.subscription_tier || 'free') as Tier
  const currentPlan   = PLANS.find(p => p.id === currentTier) || PLANS[0]
  const clientLimit   = currentPlan.limits.clients
  const jobLimit      = currentPlan.limits.jobs
  const clientPct     = clientLimit === Infinity ? 0 : Math.min((usage.clients / clientLimit) * 100, 100)
  const jobPct        = jobLimit === Infinity ? 0 : Math.min((usage.activeJobs / jobLimit) * 100, 100)
  const nearClientCap = clientLimit !== Infinity && usage.clients >= (clientLimit - 1)
  const nearJobCap    = jobLimit !== Infinity && usage.activeJobs >= (jobLimit - 1)

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

  const userInitial = profile?.business_name ? profile.business_name.charAt(0).toUpperCase() : 'S'

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
            <p className="text-sm text-gray-500 mt-0.5">Manage your workspace, profile &amp; billing</p>
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
              {nearClientCap && `${usage.clients}/${clientLimit} clients used. `}
              {nearJobCap && `${usage.activeJobs}/${jobLimit} active orders used. `}
              {currentTier === 'free' ? 'Upgrade to Designer Pro for up to 25 clients and 20 active orders.' : 'Upgrade to Fashion Studio for unlimited access.'}
            </p>
          </div>
        </div>
      )}

      {/* Profile Details Edit Card */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-7 sm:p-8 shadow-sm">
        <h3 className="text-xl font-black text-[#1e1b2e] mb-2">Studio Profile</h3>
        <p className="text-sm text-gray-500 mb-6">Update your business details and brand branding image.</p>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            {/* Logo/Avatar upload block */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center text-white text-3xl font-black bg-gradient-to-tr from-pink-500 to-purple-600 relative">
                {uploadingLogo ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : resolvedLogoUrl ? (
                  <img src={resolvedLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={uploadingLogo}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1e1b2e] text-white hover:bg-pink-500 transition-colors flex items-center justify-center shadow-lg border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <p className="font-bold text-gray-800 text-sm">Studio Profile Image</p>
              <p className="text-xs text-gray-400">Upload a square JPEG or PNG. This image appears on your dashboard, reviews, and client invoices.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#e91e8c] bg-pink-50 hover:bg-pink-100 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </button>
                {profile?.logo_url && (
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Business Name</label>
            <input
              type="text"
              required
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="e.g. Okoro Jesse Designs"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#e91e8c] focus:outline-none transition-colors font-semibold text-gray-800 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile || uploadingLogo}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all shadow-md shadow-pink-500/25 disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Workspace Details
            </button>
          </div>
        </form>
      </div>

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
              <div className="w-10 h-10 rounded-xl bg-[#1e1b2e] overflow-hidden flex items-center justify-center text-[#e91e8c] font-black text-lg flex-shrink-0">
                {resolvedLogoUrl ? (
                  <img src={resolvedLogoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
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

      {/* Feature Comparison Table */}
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
                ['Clients Limit', '5 clients', '25 clients', 'Unlimited'],
                ['Active Orders Limit', '3 orders', '20 orders', 'Unlimited'],
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
