'use client'

import { useState, useEffect, useRef } from 'react'
import { updateSubscriptionTier, updateProfile } from '@/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { getSignedUrlClient, uploadImageClient } from '@/lib/supabase/storage-client'
import { CANONICAL_PLANS, CanonicalPlanId, normalizePlanId, getPlanConfig } from '@/lib/plans'
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
import Script from 'next/script'

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

const PLAN_ICONS: Record<CanonicalPlanId, any> = {
  basic: Zap,
  designer_pro: Crown,
  fashion_studio: Building2,
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usage, setUsage] = useState<UsageStats>({ clients: 0, activeJobs: 0 })
  const [loading, setLoading] = useState(true)
  const [upgradingPlan, setUpgradingPlan] = useState<CanonicalPlanId | null>(null)
  const [upgradeStatusText, setUpgradeStatusText] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')

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

  // Auto-verify if returning from Paystack redirect (e.g. ?verify_ref=sf_sub_...)
  useEffect(() => {
    if (!loading && profile) {
      const params = new URLSearchParams(window.location.search)
      const verifyRef = params.get('verify_ref')
      const upgradeNow = params.get('upgradeNow')

      if (verifyRef) {
        // Clean URL parameter
        const url = new URL(window.location.href)
        url.searchParams.delete('verify_ref')
        window.history.replaceState({}, '', url.toString())

        // Verify transaction server-side
        handleVerifyPayment(verifyRef)
      } else if (upgradeNow) {
        const canonical = normalizePlanId(upgradeNow)
        const url = new URL(window.location.href)
        url.searchParams.delete('upgradeNow')
        window.history.replaceState({}, '', url.toString())

        const billingSection = document.getElementById('billing-section')
        if (billingSection) {
          billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        setTimeout(() => handleUpgrade(canonical), 600)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile])

  const handleVerifyPayment = async (reference: string, expectedPlanId?: CanonicalPlanId) => {
    setUpgradeStatusText('Verifying payment with server...')
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, expectedPlanId }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Payment verification failed. Your plan was not changed.')
        return
      }

      const activePlan = getPlanConfig(data.planId)
      setProfile(prev => prev ? { ...prev, subscription_tier: data.planId } : prev)
      setSuccessMsg(`🎉 Welcome to ${activePlan.name}! Your workspace subscription has been activated.`)
      router.refresh()
    } catch (err: any) {
      console.error('Verify error:', err)
      setErrorMsg('An error occurred while verifying payment. Please refresh or contact support.')
    } finally {
      setUpgradingPlan(null)
      setUpgradeStatusText('')
    }
  }

  const handleUpgrade = async (targetPlanId: CanonicalPlanId) => {
    if (!profile) return
    const currentCanonical = normalizePlanId(profile.subscription_tier)

    if (currentCanonical === targetPlanId) return

    setUpgradingPlan(targetPlanId)
    setErrorMsg(null)
    setSuccessMsg(null)
    setUpgradeStatusText('Initializing payment...')

    try {
      // 1. Initialize payment with server
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: targetPlanId }),
      })

      const initData = await initRes.json()

      if (!initRes.ok || !initData.success) {
        setErrorMsg(initData.error || 'Unable to start payment. Please try again.')
        setUpgradingPlan(null)
        return
      }

      // If switching to Basic (free/downgrade)
      if (initData.isFree) {
        const updateRes = await updateSubscriptionTier('basic')
        if (!updateRes.success) {
          setErrorMsg(updateRes.error || 'Failed to update plan.')
        } else {
          setProfile(prev => prev ? { ...prev, subscription_tier: 'basic' } : prev)
          setSuccessMsg('Workspace plan changed to Basic.')
          router.refresh()
        }
        setUpgradingPlan(null)
        return
      }

      // Paid Plan Initialization
      const { access_code, reference } = initData
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

      // Fallback: If no public key is present in client environment (e.g. dev demo mode)
      if (!paystackKey) {
        console.warn('[Paystack] Public key missing in client environment. Updating database directly for demo mode.')
        const directRes = await updateSubscriptionTier(targetPlanId)
        if (directRes.success) {
          const targetConfig = getPlanConfig(targetPlanId)
          setProfile(prev => prev ? { ...prev, subscription_tier: targetPlanId } : prev)
          setSuccessMsg(`🎉 Welcome to ${targetConfig.name}! (Demo Mode activated)`)
          router.refresh()
        } else {
          setErrorMsg(directRes.error || 'Failed to update workspace.')
        }
        setUpgradingPlan(null)
        return
      }

      setUpgradeStatusText('Opening secure checkout...')

      // Use PaystackPop handler with access_code (Paystack Inline JS V2 compatible)
      const handler = (window as any).PaystackPop?.setup({
        key: paystackKey,
        access_code,
        email: userEmail,
        amount: initData.amount,
        currency: 'NGN',
        ref: reference,
        callback: function (response: any) {
          console.log('[Paystack Callback] Transaction completed:', response)
          handleVerifyPayment(response.reference || reference, targetPlanId)
        },
        onClose: function () {
          console.log('[Paystack Callback] Checkout closed by user.')
          setUpgradingPlan(null)
          setUpgradeStatusText('')
          setErrorMsg('Payment was cancelled. Your current plan remains unchanged.')
        },
      })

      if (handler && typeof handler.openIframe === 'function') {
        handler.openIframe()
      } else {
        // Direct redirect fallback if Inline JS is blocked or unavailable
        console.warn('PaystackPop handler not ready, redirecting to authorization URL...')
        if (initData.authorization_url) {
          window.location.href = initData.authorization_url
        } else {
          setErrorMsg('Unable to open Paystack checkout modal. Please check your browser settings.')
          setUpgradingPlan(null)
        }
      }

    } catch (err: any) {
      console.error('handleUpgrade error:', err)
      setErrorMsg(err?.message || 'An unexpected error occurred while processing upgrade.')
      setUpgradingPlan(null)
      setUpgradeStatusText('')
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

  const currentCanonical = normalizePlanId(profile?.subscription_tier)
  const currentPlan = getPlanConfig(currentCanonical)
  const clientLimit = currentPlan.limits.clients
  const jobLimit = currentPlan.limits.activeJobs
  const clientPct = clientLimit === Infinity ? 0 : Math.min((usage.clients / clientLimit) * 100, 100)
  const jobPct = jobLimit === Infinity ? 0 : Math.min((usage.activeJobs / jobLimit) * 100, 100)
  const nearClientCap = clientLimit !== Infinity && usage.clients >= (clientLimit - 2)
  const nearJobCap = jobLimit !== Infinity && usage.activeJobs >= (jobLimit - 2)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#4a1525] animate-spin" />
          <p className="text-stone-500 text-sm font-medium">Loading workspace settings…</p>
        </div>
      </div>
    )
  }

  const userInitial = profile?.business_name ? profile.business_name.charAt(0).toUpperCase() : 'S'

  return (
    <>
      {/* Modern Paystack Inline JS V2 Script */}
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />

      <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-700 max-w-4xl pb-16">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fbf0f3] flex items-center justify-center text-[#4a1525]">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">Studio Settings</h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Manage your fashion workspace, atelier details &amp; subscription</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-rose-700 border border-stone-200 hover:border-rose-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            {errorMsg}
          </div>
        )}

        {/* Limit Warning */}
        {(nearClientCap || nearJobCap) && (
          <div className="flex items-start gap-3 p-4 rounded-2xl text-sm font-semibold bg-amber-50 border border-amber-200 text-amber-900">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">You&apos;re approaching your plan capacity</p>
              <p className="font-medium mt-0.5 text-amber-800/80">
                {nearClientCap && `${usage.clients}/${clientLimit} clients used. `}
                {nearJobCap && `${usage.activeJobs}/${jobLimit} active orders used. `}
                {currentCanonical === 'basic' ? 'Upgrade to Designer Pro for up to 50 clients and 30 active orders.' : 'Upgrade to Fashion Studio for unlimited access.'}
              </p>
            </div>
          </div>
        )}

        {/* Studio Profile Card */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-7 sm:p-8 shadow-xs">
          <h3 className="text-xl font-serif font-bold text-[#18131d] mb-1">Studio Profile</h3>
          <p className="text-xs sm:text-sm text-stone-500 mb-6">Update your business name and studio branding image.</p>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
              {/* Logo container */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-inner flex items-center justify-center text-white text-3xl font-serif font-bold bg-[#18131d] relative">
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
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#4a1525] text-white hover:bg-[#5c1d30] transition-colors flex items-center justify-center shadow-md border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <p className="font-bold text-stone-900 text-sm">Studio Profile Image</p>
                <p className="text-xs text-stone-500">Upload a square JPEG or PNG. Appears on client invoices and review links.</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#4a1525] bg-[#fbf0f3] hover:bg-[#fbcfe0] transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                  </button>
                  {profile?.logo_url && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={uploadingLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
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
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Business / Atelier Name</label>
              <input
                type="text"
                required
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="e.g. Okoro Jesse Designs"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#4a1525] focus:outline-none transition-colors font-semibold text-stone-900 text-sm bg-[#FAF8F5]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile || uploadingLogo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs text-white bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-sm disabled:opacity-60"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Workspace Details
              </button>
            </div>
          </form>
        </div>

        {/* Current Plan & Usage */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-7 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-6">

            {/* Plan header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Current Plan</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-serif font-bold text-[#18131d]">{currentPlan.name}</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#4a1525] text-white uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <p className="text-[#4a1525] font-serif font-bold mt-1 text-xl">{currentPlan.formattedPrice}<span className="text-xs font-normal text-stone-500">{currentPlan.period}</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#fbf0f3] flex items-center justify-center text-[#4a1525]">
                {(() => {
                  const IconComponent = PLAN_ICONS[currentCanonical] || Zap
                  return <IconComponent className="w-6 h-6" />
                })()}
              </div>
            </div>

            {/* Usage meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#4a1525]" />
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Clients</span>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {usage.clients}{clientLimit !== Infinity ? ` / ${clientLimit}` : ' / ∞'}
                  </span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-[#4a1525]"
                    style={{
                      width: clientLimit === Infinity ? '25%' : `${clientPct}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#4a1525]" />
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Active Orders</span>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {usage.activeJobs}{jobLimit !== Infinity ? ` / ${jobLimit}` : ' / ∞'}
                  </span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-[#4a1525]"
                    style={{
                      width: jobLimit === Infinity ? '25%' : `${jobPct}%`,
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Subscription Plan Switcher */}
        <div id="billing-section" className="space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#18131d]">Subscription Plans</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">All prices in NGN (₦). Secure transaction processing via Paystack.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(['basic', 'designer_pro', 'fashion_studio'] as CanonicalPlanId[]).map((planId) => {
              const plan = CANONICAL_PLANS[planId]
              const isCurrentPlan = currentCanonical === planId
              const isUpgradingThis = upgradingPlan === planId
              const IconComponent = PLAN_ICONS[planId] || Zap
              const isDowngrade = Object.keys(CANONICAL_PLANS).indexOf(planId) < Object.keys(CANONICAL_PLANS).indexOf(currentCanonical)

              return (
                <div
                  key={planId}
                  className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between ${
                    isCurrentPlan
                      ? 'bg-white border-2 border-[#4a1525] shadow-md'
                      : plan.highlight
                      ? 'bg-[#18131d] text-white border-2 border-[#4a1525] shadow-lg'
                      : 'bg-white text-stone-900 border border-stone-200/90 shadow-xs'
                  }`}
                >
                  {/* Badges */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#4a1525] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                        Current Plan
                      </span>
                    </div>
                  )}
                  {plan.badge && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        plan.highlight ? 'bg-[#d9467c] text-white' : 'bg-stone-200 text-stone-800'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#fbf0f3] flex items-center justify-center mb-4 text-[#4a1525]">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight && !isCurrentPlan ? 'text-[#d9467c]' : 'text-stone-500'}`}>
                      {plan.name}
                    </div>

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-serif text-2xl font-bold">{plan.formattedPrice}</span>
                      <span className={`text-xs ${plan.highlight && !isCurrentPlan ? 'text-stone-400' : 'text-stone-500'}`}>{plan.period}</span>
                    </div>

                    <p className={`text-xs mb-5 leading-relaxed ${plan.highlight && !isCurrentPlan ? 'text-stone-300' : 'text-stone-600'}`}>
                      {plan.tagline}
                    </p>

                    <ul className="space-y-2.5 mb-6 text-xs">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 font-medium">
                          <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight && !isCurrentPlan ? 'text-[#d9467c]' : 'text-[#4a1525]'}`} />
                          <span className={plan.highlight && !isCurrentPlan ? 'text-stone-200' : 'text-stone-700'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <button
                      onClick={() => !isCurrentPlan && !upgradingPlan && handleUpgrade(planId)}
                      disabled={isCurrentPlan || upgradingPlan !== null}
                      className={`w-full py-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-stone-100 text-stone-500 cursor-default'
                          : plan.highlight
                          ? 'bg-[#4a1525] text-white hover:bg-[#5c1d30] shadow-md'
                          : isDowngrade
                          ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          : 'bg-[#18131d] text-white hover:bg-stone-800'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {isUpgradingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{upgradeStatusText || 'Processing...'}</span>
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <Check className="w-4 h-4" />
                          Active Plan
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          {planId === 'basic' ? 'Switch to Basic' : `Upgrade to ${plan.name}`}
                        </>
                      )}
                    </button>

                    {!isCurrentPlan && planId !== 'basic' && (
                      <p className="text-center text-[10px] text-stone-400 mt-2.5 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Secured by Paystack
                      </p>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Logout Button */}
        <div className="sm:hidden pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold text-rose-700 border border-rose-200 bg-rose-50 w-full justify-center"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Workspace
          </button>
        </div>

      </div>
    </>
  )
}
