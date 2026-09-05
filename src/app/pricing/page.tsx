import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Pricing — StitchFlow',
  description: 'Simple, transparent pricing in Nigerian Naira for fashion businesses, tailors, and design houses.',
}

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    naira: '3,000',
    period: '/month',
    tagline: 'Essential workflow tools for solo tailors',
    badge: null,
    highlight: false,
    cta: 'Start Basic Plan',
    ctaHref: '/register?plan=basic',
    features: [
      { text: 'Up to 15 client profiles', included: true },
      { text: '10 active projects at a time', included: true },
      { text: 'Body measurement engine', included: true },
      { text: 'Professional invoice generation', included: true },
      { text: 'Client review links', included: true },
      { text: 'Standard email support', included: true },
      { text: 'Studio analytics & reports', included: false },
      { text: 'Unlimited active projects', included: false },
      { text: 'Custom invoice branding', included: false },
      { text: 'Multi-designer access', included: false },
    ],
  },
  {
    id: 'designer_pro',
    name: 'Designer Pro',
    naira: '7,000',
    period: '/month',
    tagline: 'For growing boutique studios & tailors',
    badge: 'Most Popular',
    highlight: true,
    cta: 'Start Designer Pro',
    ctaHref: '/register?plan=designer_pro',
    features: [
      { text: 'Up to 50 client profiles', included: true },
      { text: 'Up to 30 active projects', included: true },
      { text: 'Full body measurement engine & history', included: true },
      { text: 'Invoicing & deposit balance tracking', included: true },
      { text: 'Client satisfaction review links', included: true },
      { text: 'Studio analytics & revenue reports', included: true },
      { text: 'Fabric & style image uploads', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Multi-designer access', included: false },
    ],
  },
  {
    id: 'fashion_studio',
    name: 'Fashion Studio',
    naira: '25,000',
    period: '/month',
    tagline: 'For large design houses & ateliers',
    badge: 'Enterprise',
    highlight: false,
    cta: 'Start Fashion Studio',
    ctaHref: '/register?plan=fashion_studio',
    features: [
      { text: 'Unlimited client profiles', included: true },
      { text: 'Unlimited active projects', included: true },
      { text: 'Full body measurement engine & history', included: true },
      { text: 'Advanced invoicing & payment tracking', included: true },
      { text: 'Client satisfaction review links', included: true },
      { text: 'Custom branding on client invoices', included: true },
      { text: 'Studio analytics & revenue reports', included: true },
      { text: 'Multi-designer team workflow', included: true },
      { text: 'Dedicated support', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans selection:bg-[#4a1525] selection:text-white">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#18131d] p-1.5 flex items-center justify-center shadow-sm">
                <Image src="/logo.png" alt="StitchFlow" width={32} height={32} className="object-contain filter brightness-200 invert" />
              </div>
              <span className="font-serif text-2xl font-bold text-[#18131d] tracking-tight">
                Stitch<span className="text-[#4a1525]">Flow</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-medium text-stone-600 hover:text-[#4a1525] transition-colors hidden sm:block">
                Homepage
              </Link>
              <Link href="/login" className="text-sm font-semibold text-stone-700 px-3 py-2 rounded-xl hover:bg-stone-100 transition-all">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-bold text-white bg-[#4a1525] hover:bg-[#5c1d30] px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
              >
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Header Banner */}
      <section className="py-16 sm:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#fbf0f3] border border-[#fbcfe0] rounded-full px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d9467c]" />
            <span className="text-xs font-bold text-[#d9467c] uppercase tracking-widest">TRANSPARENT PRICING</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#18131d] leading-tight">
            Predictable Pricing for Your Studio
          </h1>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-normal">
            All prices are in Nigerian Naira (₦). Clear monthly plans with no hidden fees or payment percentage cuts.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
                  plan.highlight
                    ? 'bg-[#18131d] text-white border-2 border-[#4a1525] shadow-xl scale-105'
                    : 'bg-white text-[#1C1917] border border-stone-200/90 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#4a1525] text-white shadow-xs">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-[#d9467c]' : 'text-stone-500'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold">₦{plan.naira}</span>
                    <span className={`text-xs ${plan.highlight ? 'text-stone-400' : 'text-stone-500'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-xs mb-6 ${plan.highlight ? 'text-stone-300' : 'text-stone-600'}`}>
                    {plan.tagline}
                  </p>

                  {/* CTA */}
                  <div className="mb-8">
                    <Link
                      href={plan.ctaHref}
                      className={`block w-full text-center font-bold py-3 rounded-full text-xs transition-all ${
                        plan.highlight
                          ? 'bg-[#4a1525] text-white hover:bg-[#5c1d30] shadow-md'
                          : 'bg-[#FAF8F5] text-[#18131d] border border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3">
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${plan.highlight ? 'text-stone-400' : 'text-stone-500'}`}>
                      Included Features
                    </div>
                    {plan.features.map(({ text, included }) => (
                      <div key={text} className="flex items-start gap-2.5">
                        {included ? (
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#d9467c]' : 'text-[#4a1525]'}`} />
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border border-stone-300 flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-stone-300 rounded-full" />
                          </div>
                        )}
                        <span className={`text-xs ${included ? (plan.highlight ? 'text-stone-200' : 'text-stone-700') : 'text-stone-400'}`}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#18131d] text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">CLEAR ANSWERS</span>
            <h2 className="font-serif text-3xl font-black mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              { q: 'Can I change my plan later?', a: 'Yes. You can upgrade or adjust your plan anytime directly from your Studio Settings.' },
              { q: 'Does StitchFlow take a cut of my sales?', a: 'No. StitchFlow is a fixed monthly SaaS workspace. We do not charge percentage transaction fees on your customer invoices.' },
              { q: 'Is there a free trial?', a: 'Yes! You can start using StitchFlow immediately for free to organize your first clients and projects.' },
              { q: 'Is my customer data secure?', a: 'Yes. All client records and measurements are encrypted and strictly protected under your business account.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#241e2b] rounded-2xl p-6 border border-stone-800 space-y-2">
                <h3 className="font-serif text-sm font-bold text-white">{q}</h3>
                <p className="text-xs text-stone-300 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#4a1525] hover:bg-[#5c1d30] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg"
            >
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#100d14] py-8 text-center border-t border-stone-800">
        <p className="text-xs text-stone-400">
          © {new Date().getFullYear()} StitchFlow. All rights reserved. · <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </p>
      </footer>
    </div>
  )
}
