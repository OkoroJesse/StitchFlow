import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Scissors, Users, BarChart3, CreditCard, Star, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans selection:bg-[#4a1525] selection:text-white">

      {/* ── NAV BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo area */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#18131d] p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="StitchFlow" width={32} height={32} className="object-contain filter brightness-200 invert" />
              </div>
              {/* On mobile: HIDE text as requested ("leave only the logo and a login button and a get started free button") */}
              <span className="hidden md:inline font-serif text-2xl font-black text-[#18131d] tracking-tight">
                Stitch<span className="text-[#d9467c]">Flow</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                ['#features', 'Features'],
                ['#pricing', 'Pricing'],
                ['#about', 'About'],
              ].map(([href, label]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-semibold text-stone-600 hover:text-[#4a1525] transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold text-stone-700 hover:text-[#4a1525] px-3 py-2 rounded-xl transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white px-4 sm:px-5 py-2.5 rounded-full bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 bg-[#FAF8F5]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#4a1525]/10 via-[#d9467c]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left – Copy */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#fbf0f3] border border-[#fbcfe0]">
                <Sparkles className="w-4 h-4 text-[#d9467c]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
                  The Fashion OS Platform
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#18131d]">
                Run Your Fashion<br className="hidden sm:block" />
                Business in<br />
                <span className="italic font-normal text-[#4a1525]">Perfect Stitch</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                StitchFlow is the all-in-one platform for tailors, designers, and ateliers to manage clients, body measurements, project workflows, and invoices.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full text-white text-sm sm:text-base bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#pricing"
                  className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full text-stone-800 bg-white border border-stone-200/90 text-sm sm:text-base hover:bg-stone-50 transition-all shadow-sm"
                >
                  View Pricing
                </a>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-200/80">
                {[
                  { icon: Users, label: 'Client Directory' },
                  { icon: Scissors, label: 'Workflow Tracking' },
                  { icon: CreditCard, label: 'Invoices & Payments' },
                  { icon: BarChart3, label: 'Studio Analytics' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center lg:items-start gap-1.5 text-center lg:text-left">
                    <div className="w-8 h-8 rounded-xl bg-[#fbf0f3] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#d9467c]" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Visual Card Presentation */}
            <div className="relative flex items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#4a1525]/10 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#18131d] text-white flex items-center justify-center font-bold text-sm">
                      SF
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">Atelier Dashboard</h4>
                      <p className="text-xs text-stone-500">Live Business Overview</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Revenue Card preview */}
                  <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Monthly Revenue</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fbf0f3] text-[#d9467c]">
                        +18.6%
                      </span>
                    </div>
                    <div className="font-serif text-3xl font-black text-[#18131d]">₦845,200</div>
                  </div>

                  {/* Orders snippet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#4a1525]/10 text-[#4a1525] flex items-center justify-center font-bold text-xs">
                          #24
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900">Custom Senator Suit</div>
                          <div className="text-[10px] text-stone-500">Chief Adebayo</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                        Sewing
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          #25
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900">Bridal Silk Gown</div>
                          <div className="text-[10px] text-stone-500">Kemi Alabi</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section id="about" className="py-16 bg-[#18131d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
                Crafted for Ateliers
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold mt-2 mb-4">
                Designed for Fashion Entrepreneurs
              </h2>
              <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
                From boutique tailors to high-end fashion houses, StitchFlow brings structure and elegance to your daily operations so you can focus on master craftmanship.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-stone-800 pt-6 md:pt-0 md:pl-8">
              {[
                { value: '500+', label: 'Fashion Studios' },
                { value: '10K+', label: 'Client Profiles' },
                { value: '1M+', label: 'Orders Managed' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center md:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[#d9467c]">{value}</div>
                  <div className="text-xs text-stone-400 mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-20 sm:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              Built for Growth
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#18131d] mt-2 mb-4">
              All your studio tools in one place
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Stop juggling paper notes and WhatsApp messages. Organize your fashion business with bespoke digital tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Users,
                title: 'Client Measurement Profiles',
                desc: 'Categorized garment profiles for Men and Women. Save neck, chest, waist, and full height data for easy reuse.',
              },
              {
                icon: Scissors,
                title: 'Project Pipeline Tracking',
                desc: 'Track jobs across Cutting, Sewing, Fitting, and Ready states with live status updates.',
              },
              {
                icon: CreditCard,
                title: 'Invoices & Deposit Management',
                desc: 'Generate professional invoices, track deposit payments, and manage outstanding client balances.',
              },
              {
                icon: Star,
                title: 'Client Satisfaction Reviews',
                desc: 'Share unique review links with clients upon project delivery to collect ratings and feedback.',
              },
              {
                icon: BarChart3,
                title: 'Business Insights',
                desc: 'Clear analytics on monthly revenue, top clients, and project turnaround times.',
              },
              {
                icon: CheckCircle,
                title: 'Mobile PWA Support',
                desc: 'Install StitchFlow on your smartphone home screen for fast access right on your phone.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#fbf0f3] flex items-center justify-center mb-5 group-hover:bg-[#4a1525] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6 text-[#d9467c] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#18131d] mb-2">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
            Transparent Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#18131d] mt-2 mb-4">
            Select your plan
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mb-16">
            Simple monthly plans tailored to your fashion studio size.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {[
              {
                name: 'Basic Plan',
                price: '₦3,000',
                period: '/month',
                desc: 'Essential tools for solo tailors',
                features: [
                  'Up to 15 client profiles',
                  '10 active projects',
                  'Basic measurement records',
                  'Invoice generator',
                ],
                highlight: false,
                cta: 'Get Basic Plan',
              },
              {
                name: 'Designer Pro',
                price: '₦7,000',
                period: '/month',
                desc: 'For growing fashion businesses',
                features: [
                  'Up to 50 client profiles',
                  '30 active projects',
                  'Full body measurement engine',
                  'Client review links',
                  'Studio analytics',
                ],
                highlight: true,
                cta: 'Get Designer Pro',
              },
              {
                name: 'Fashion Studio',
                price: '₦25,000',
                period: '/month',
                desc: 'For large ateliers & design houses',
                features: [
                  'Unlimited client profiles',
                  'Unlimited active projects',
                  'Multi-tailor workflow access',
                  'Custom branding on invoices',
                  'Priority support',
                ],
                highlight: false,
                cta: 'Get Fashion Studio',
              },
            ].map(({ name, price, period, desc, features, highlight, cta }) => (
              <div
                key={name}
                className={`rounded-3xl p-8 transition-all flex flex-col justify-between ${
                  highlight
                    ? 'bg-[#18131d] text-white border-2 border-[#d9467c] shadow-xl scale-105'
                    : 'bg-[#FAF8F5] text-[#1C1917] border border-stone-200/90 shadow-sm'
                }`}
              >
                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                      highlight ? 'text-[#d9467c]' : 'text-stone-500'
                    }`}
                  >
                    {name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold">{price}</span>
                    <span className={`text-xs ${highlight ? 'text-stone-400' : 'text-stone-500'}`}>
                      {period}
                    </span>
                  </div>
                  <p className={`text-xs mb-6 ${highlight ? 'text-stone-300' : 'text-stone-600'}`}>
                    {desc}
                  </p>

                  <div className="space-y-3 mb-8">
                    {features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5 text-xs font-medium">
                        <CheckCircle
                          className={`w-4 h-4 flex-shrink-0 ${
                            highlight ? 'text-[#d9467c]' : 'text-[#4a1525]'
                          }`}
                        />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/register"
                  className={`w-full block text-center py-3 rounded-full text-xs font-bold transition-all ${
                    highlight
                      ? 'bg-[#4a1525] hover:bg-[#5c1d30] text-white shadow-md'
                      : 'bg-white hover:bg-stone-100 text-[#18131d] border border-stone-300'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 bg-[#18131d] text-white border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4a1525] flex items-center justify-center text-white font-serif font-bold text-xs">
              SF
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">
              Stitch<span className="text-[#d9467c]">Flow</span>
            </span>
          </div>

          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} StitchFlow. The Operating System for Fashion Businesses.
          </p>

          <div className="flex gap-6 text-xs text-stone-400">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
