import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, ArrowRight, Star, Zap, Shield } from 'lucide-react'

export const metadata = {
  title: 'Pricing — StitchFlow',
  description: 'Simple, transparent pricing in Nigerian Naira for fashion businesses of all sizes.',
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    naira: '3,000',
    period: '/month',
    tagline: 'Perfect for getting started',
    badge: null,
    color: 'bg-white border-gray-200',
    headerColor: 'bg-gray-50',
    cta: 'Start Basic',
    ctaHref: '/register?plan=basic',
    ctaStyle: 'bg-[#1e1b2e] text-white hover:bg-[#2a2650]',
    features: [
      { text: 'Up to 5 clients', included: true },
      { text: '3 active projects at a time', included: true },
      { text: 'Basic client profiles & measurements', included: true },
      { text: 'Invoice generation', included: true },
      { text: 'Client review links', included: true },
      { text: 'Email support', included: true },
      { text: 'Business analytics', included: false },
      { text: 'Unlimited clients & projects', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Priority support', included: false },
      { text: 'Multi-designer access', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'designer',
    name: 'Designer Pro',
    naira: '7,000',
    period: '/month',
    tagline: 'For growing boutique businesses',
    badge: 'Most Popular',
    color: 'bg-[#1e1b2e] border-pink-500/30',
    headerColor: 'bg-[#2d2540]',
    cta: 'Start Designer Pro',
    ctaHref: '/register?plan=designer',
    ctaStyle: 'bg-pink-500 text-white hover:bg-pink-400 shadow-lg shadow-amber-500/25',
    features: [
      { text: 'Up to 25 clients', included: true },
      { text: 'Up to 20 active projects', included: true },
      { text: 'Full client profiles & measurements', included: true },
      { text: 'Advanced invoicing & payment tracking', included: true },
      { text: 'Client review links', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Business analytics dashboard', included: true },
      { text: 'Fabric & style image uploads', included: true },
      { text: 'Custom branding (logo & colours)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Multi-designer access', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'studio',
    name: 'Fashion Studio',
    naira: '25,000',
    period: '/month',
    tagline: 'For large design houses & studios',
    badge: 'Enterprise',
    color: 'bg-white border-gray-200',
    headerColor: 'bg-pink-50',
    cta: 'Contact Sales',
    ctaHref: '/register?plan=studio',
    ctaStyle: 'bg-[#1e1b2e] text-white hover:bg-[#2a2650]',
    features: [
      { text: 'Unlimited clients', included: true },
      { text: 'Unlimited active projects', included: true },
      { text: 'Full client profiles & measurements', included: true },
      { text: 'Advanced invoicing & payment tracking', included: true },
      { text: 'Client review links', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Advanced analytics suite & reports', included: true },
      { text: 'Fabric & style image uploads', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Priority phone & video support', included: true },
      { text: 'Multi-designer team access', included: true },
      { text: 'Full API access', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5">
              <Image src="/logo.png" alt="StitchFlow" width={64} height={64} className="object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(233,30,140,0.2))' }} />
              <span className="text-2xl font-black text-gray-900 tracking-tight">Stitch<span className="text-pink-600">Flow</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Home</Link>
              <Link href="/login" className="text-sm font-semibold text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all hidden sm:block">Login</Link>
              <Link href="/register" className="text-sm font-bold text-white bg-[#1e1b2e] hover:bg-[#2a2650] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5">
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wide">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Grow your fashion business<br className="hidden sm:block" />
            at your own pace
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            All prices are in Nigerian Naira (₦). Start free — upgrade only when you&apos;re ready.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: Zap, text: 'Instant setup' },
              { icon: Shield, text: 'Secure & private' },
              { icon: Star, text: 'No hidden fees' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <Icon className="w-3.5 h-3.5 text-pink-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-[2rem] border overflow-hidden transition-all hover:shadow-xl ${plan.color}`}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${plan.id === 'designer' ? 'bg-pink-500 text-white' : 'bg-stone-200 text-gray-700'}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`p-6 sm:p-8 pb-6 ${plan.headerColor} ${plan.id === 'designer' ? 'border-b border-stone-700' : 'border-b border-gray-100'}`}>
                  <div className={`text-xs font-black uppercase tracking-widest mb-3 ${plan.id === 'designer' ? 'text-pink-400' : 'text-gray-500'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    {plan.naira ? (
                      <>
                        <span className={`text-3xl sm:text-4xl font-black tracking-tight ${plan.id === 'designer' ? 'text-white' : 'text-gray-900'}`}>
                          ₦{plan.naira}
                        </span>
                        <span className={`text-sm font-medium mb-1.5 ${plan.id === 'designer' ? 'text-gray-400' : 'text-gray-400'}`}>
                          {plan.period}
                        </span>
                      </>
                    ) : (
                      <span className={`text-3xl sm:text-4xl font-black tracking-tight ${plan.id === 'designer' ? 'text-white' : 'text-gray-900'}`}>
                        Free
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm ${plan.id === 'designer' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* CTA */}
                <div className="px-6 sm:px-8 py-5">
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full text-center font-bold py-3.5 rounded-xl transition-all text-sm ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                {/* Features */}
                <div className="px-6 sm:px-8 pb-8 space-y-3">
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-4 ${plan.id === 'designer' ? 'text-gray-500' : 'text-gray-400'}`}>
                    What&apos;s included
                  </div>
                  {plan.features.map(({ text, included }) => (
                    <div key={text} className="flex items-start gap-2.5">
                      {included ? (
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.id === 'designer' ? 'text-pink-500' : 'text-emerald-500'}`} />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border border-gray-300 flex items-center justify-center">
                          <div className="w-1.5 h-0.5 bg-stone-300 rounded-full" />
                        </div>
                      )}
                      <span className={`text-xs sm:text-sm ${included ? (plan.id === 'designer' ? 'text-gray-300' : 'text-gray-700') : 'text-gray-400'}`}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Trust Strip */}
      <section className="bg-[#1e1b2e] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-10">Common Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade your plan at any time from your Studio Settings. Changes take effect immediately.' },
              { q: 'What happens when I hit my free limit?', a: 'You\'ll receive a notification when approaching your limit. You can upgrade to Designer Pro to continue adding clients and projects.' },
              { q: 'Is my data safe?', a: 'Absolutely. Your business data is encrypted and securely stored. We never share your client or business information with third parties.' },
              { q: 'Do I need a credit card to start?', a: 'No. Our Free plan is completely free forever — no credit card required to sign up and start using StitchFlow.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#2d2540] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-2">{q}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-pink-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-pink-400 transition-all shadow-xl shadow-pink-500/20"
            >
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#12101e] py-8 text-center">
        <p className="text-xs text-gray-600">© 2025 StitchFlow. All rights reserved. · <Link href="/login" className="hover:text-gray-400 transition-colors">Login</Link></p>
      </footer>
    </div>
  )
}
