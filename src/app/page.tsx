import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Scissors, Users, BarChart3, CreditCard, Star, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#f8f7fc', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #ede9f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 group">
              <Image src="/logo.png" alt="StitchFlow" width={64} height={64} className="object-contain" style={{ filter: 'drop-shadow(0 2px 6px rgba(233,30,140,0.25))' }} />
              <span className="text-2xl font-black tracking-tight" style={{ color: '#1a1625' }}>Stitch<span style={{ color: '#e91e8c' }}>Flow</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {[['#features','Features'],['#pricing','Pricing'],['#about','About']].map(([href, label]) => (
                <Link key={label} href={href} className="text-sm font-medium transition-colors text-[#6b7280] hover:text-[#e91e8c]"
                >{label}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-semibold px-3 py-2 rounded-lg transition-all" style={{ color: '#3d3551' }}>
                Login
              </Link>
              <Link href="/register" className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all" style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}>
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-0 md:pt-24" style={{ background: '#f8f7fc' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(233,30,140,0.07), transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 70%, rgba(124,58,237,0.06), transparent 60%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left – Copy */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: '#fdf2f8', border: '1px solid #fce7f3' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#e91e8c' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#c4177a' }}>Fashion Management, Tailored for You</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight" style={{ color: '#1a1625' }}>
                Run Your Fashion<br className="hidden sm:block" />
                Business in<br />
                Perfect <span style={{ color: '#e91e8c', fontStyle: 'italic' }}>Stitch</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0" style={{ color: '#6b7280' }}>
                StitchFlow is the all-in-one platform for tailors and designers to manage customers, measurements, orders, and payments with ease and elegance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/register" className="flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-2xl text-white text-sm sm:text-base transition-all" style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)', boxShadow: '0 8px 28px rgba(233,30,140,0.3)' }}>
                  Get Started Free
                </Link>
                <Link href="/pricing" className="flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-2xl text-sm sm:text-base transition-all" style={{ background: 'white', color: '#1a1625', border: '1.5px solid #ede9f6' }}>
                  View Pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[
                  { icon: Users, label: 'Customer & Measurement Management' },
                  { icon: Scissors, label: 'Order & Workflow Tracking' },
                  { icon: CreditCard, label: 'Invoices & Payments' },
                  { icon: BarChart3, label: 'Analytics & Business Insights' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center lg:items-start gap-1.5 text-center lg:text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f8' }}>
                      <Icon className="w-4 h-4" style={{ color: '#e91e8c' }} />
                    </div>
                    <span className="text-[11px] font-semibold leading-tight" style={{ color: '#9ca3af' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Visual Block */}
            <div className="relative h-[400px] sm:h-[500px] lg:h-[580px] flex items-center justify-center">
              <div className="absolute right-0 top-8 w-full h-full rounded-[3rem]" style={{ background: 'linear-gradient(135deg, #fdf2f8, #f5f3ff)' }} />

              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                {/* Dress illustration card */}
                <div className="relative flex items-center justify-center">
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-[#fce7f3]/80 flex items-center justify-center w-[170px] sm:w-[200px] aspect-[2/3] transform rotate-3 hover:rotate-0 transition-transform duration-500 relative z-10">
                    <img src="/mannequin.png" alt="Designer Mannequin" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2.5 h-36 rounded-full rotate-12 shadow opacity-40" style={{ background: 'linear-gradient(to bottom, #fce7f3, #ddd6fe)' }} />
                </div>
              </div>

              {/* Revenue Card */}
              <div className="absolute bottom-8 right-0 sm:right-4 z-20 bg-white rounded-2xl p-4 sm:p-5 min-w-[200px] sm:min-w-[220px]" style={{ boxShadow: '0 12px 40px rgba(233,30,140,0.12)', border: '1px solid #fce7f3' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>Revenue Overview</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fdf2f8', color: '#e91e8c' }}>This Month</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: '#1a1625' }}>₦845,200</div>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-xs font-bold" style={{ color: '#22c55e' }}>↑ 18.6%</span>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>vs last month</span>
                </div>
                <div className="relative h-12 overflow-hidden">
                  <svg viewBox="0 0 200 48" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#e91e8c" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,40 C20,38 30,30 50,28 C70,26 80,32 100,22 C120,12 130,18 150,10 C170,2 180,8 200,4" fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M0,40 C20,38 30,30 50,28 C70,26 80,32 100,22 C120,12 130,18 150,10 C170,2 180,8 200,4 L200,48 L0,48 Z" fill="url(#chartGrad)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 h-16" style={{ background: '#1a1625', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── STATS BAND ── */}
      <section id="about" className="py-14 sm:py-20" style={{ background: '#1a1625' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="rounded-[2.5rem] overflow-hidden h-64 sm:h-80 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #2d1b4e, #1a1625)' }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(233,30,140,0.15), transparent 60%)' }} />
              {/* Clothing silhouettes */}
              <div className="flex items-end gap-6 pb-6 relative z-10">
                <div className="flex flex-col items-center gap-0">
                  <div className="w-11 h-11 rounded-full" style={{ background: '#4b4568' }} />
                  <div className="w-14 h-28 rounded-t-3xl" style={{ background: 'linear-gradient(to bottom, #e91e8c, #7c3aed)' }} />
                  <div className="flex gap-1">
                    <div className="w-5 h-10 rounded-b" style={{ background: '#2d2540' }} />
                    <div className="w-5 h-10 rounded-b" style={{ background: '#2d2540' }} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0">
                  <div className="w-10 h-10 rounded-full" style={{ background: '#6b5c82' }} />
                  <div className="w-12 h-20 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, #c4177a, #e91e8c)' }} />
                  <div className="w-20 h-16 rounded-b-[2rem] -mt-1" style={{ background: 'linear-gradient(to bottom, #a3156a, #c4177a)' }} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Designed for<br />Fashion Entrepreneurs
              </h2>
              <p className="leading-relaxed text-base" style={{ color: '#8b7fa8' }}>
                From boutique tailors to growing design houses, StitchFlow helps you save time, delight your customers, and grow your brand.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { value: '500+', label: 'Fashion Businesses' },
                  { value: '10K+', label: 'Happy Customers' },
                  { value: '1M+', label: 'Orders Managed' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center pr-4 last:pr-0" style={{ borderRight: '1px solid #2d2540' }}>
                    <div className="text-2xl sm:text-3xl font-black" style={{ color: '#e91e8c' }}>{value}</div>
                    <div className="text-xs mt-1 font-medium" style={{ color: '#8b7fa8' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: '#fdf2f8', border: '1px solid #fce7f3' }}>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#c4177a' }}>Everything You Need</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#1a1625' }}>All your tools, one platform</h2>
            <p className="leading-relaxed" style={{ color: '#6b7280' }}>Stop juggling between notebooks, WhatsApp chats, and spreadsheets. StitchFlow gives you one beautiful workspace.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, title: 'Client Directory', desc: 'Store full client profiles with measurements, preferences, contact info, and order history in one place.', iconBg: '#fdf2f8', iconColor: '#e91e8c' },
              { icon: Scissors, title: 'Job Management', desc: 'Track every order from first measurement to final delivery. Attach fabric references and style images.', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
              { icon: CreditCard, title: 'Invoicing & Payments', desc: 'Generate beautiful invoices, track outstanding payments, and manage your revenue stream seamlessly.', iconBg: '#f0fdf4', iconColor: '#16a34a' },
              { icon: Star, title: 'Client Reviews', desc: 'Collect professional feedback from clients with unique shareable review links for each project.', iconBg: '#fffbeb', iconColor: '#d97706' },
              { icon: BarChart3, title: 'Business Analytics', desc: 'Get insights on your revenue, top clients, delivery timelines, and business performance at a glance.', iconBg: '#fdf2f8', iconColor: '#c4177a' },
              { icon: CheckCircle, title: 'Measurement Library', desc: 'Maintain a structured measurement database for each client, updated and versioned over time.', iconBg: '#f0f9ff', iconColor: '#0284c7' },
            ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div key={title} className="group bg-white rounded-[2rem] p-8 border-[1.5px] border-[#ede9f6] hover:border-[#fce7f3] transition-all duration-300 cursor-default hover:shadow-lg hover:shadow-[#e91e8c]/8"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: iconBg }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#1a1625' }}>{title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section id="pricing" className="py-20 sm:py-28" style={{ background: '#f8f7fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: '#fdf2f8', border: '1px solid #fce7f3' }}>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#c4177a' }}>Simple Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#1a1625' }}>Start free, grow with your business</h2>
          <p className="mb-12 max-w-xl mx-auto" style={{ color: '#6b7280' }}>All prices in Nigerian Naira. No hidden fees, no surprises.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Basic', price: '₦3,000', period: '/mo', desc: 'Perfect for getting started', features: ['Up to 5 clients', '3 active projects', 'Basic invoicing', 'Client review links'], cta: 'Get Started', highlight: false },
              { name: 'Designer Pro', price: '₦7,000', period: '/mo', desc: 'For growing fashion businesses', features: ['Up to 25 clients', 'Up to 20 active projects', 'Advanced analytics', 'Custom branding', 'Priority support'], cta: 'Start Pro Trial', highlight: true },
              { name: 'Fashion Studio', price: '₦25,000', period: '/mo', desc: 'For large design houses', features: ['Everything in Pro', 'Unlimited clients', 'Unlimited active projects', 'Multi-designer access', 'White-label branding'], cta: 'Contact Sales', highlight: false },
            ].map(({ name, price, period, desc, features, cta, highlight }) => (
              <div key={name} className="rounded-[2rem] p-8 text-left transition-all" style={highlight ? { background: '#1a1625', border: '2px solid #e91e8c', boxShadow: '0 12px 40px rgba(233,30,140,0.2)' } : { background: 'white', border: '1.5px solid #ede9f6' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: highlight ? '#e91e8c' : '#9ca3af' }}>{name}</div>
                <div className="text-3xl font-black mb-1" style={{ color: highlight ? 'white' : '#1a1625' }}>{price}<span className="text-base font-medium" style={{ color: highlight ? '#8b7fa8' : '#9ca3af' }}>{period}</span></div>
                <div className="text-sm mb-6" style={{ color: highlight ? '#8b7fa8' : '#9ca3af' }}>{desc}</div>
                <div className="space-y-3 mb-8">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: highlight ? '#ddd6fe' : '#6b7280' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: highlight ? '#e91e8c' : '#22c55e' }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" className="block w-full text-center font-bold py-3 rounded-xl text-sm transition-all" style={highlight ? { background: 'linear-gradient(135deg, #e91e8c, #7c3aed)', color: 'white', boxShadow: '0 4px 14px rgba(233,30,140,0.3)' } : { background: '#f8f7fc', color: '#1a1625', border: '1.5px solid #ede9f6' }}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: '#1a1625' }}>Loved by fashion entrepreneurs</h2>
            <p style={{ color: '#6b7280' }}>Join hundreds of designers who've transformed their business with StitchFlow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Amara Okafor', role: 'Luxury Tailor, Lagos', quote: 'StitchFlow completely changed how I manage my clients. I used to lose track of measurements — now everything is just a click away.' },
              { name: 'Chinwe Designs', role: 'Fashion Designer, Abuja', quote: 'The invoicing feature alone saves me hours every week. My clients love how professional the payment receipts look.' },
              { name: 'House of Phavour', role: 'Bridal Boutique, Port Harcourt', quote: 'From fitting sessions to final delivery, StitchFlow tracks everything. I don\'t know how I managed without it!' },
            ].map(({ name, role, quote }) => (
              <div key={name} className="rounded-[2rem] p-7" style={{ background: '#f8f7fc', border: '1.5px solid #ede9f6' }}>
                <div className="flex mb-4 gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4" fill="#e91e8c" style={{ color: '#e91e8c' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#4b4568' }}>"{quote}"</p>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1a1625' }}>{name}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 60%, #1a1625 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(233,30,140,0.15), transparent 70%)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 relative z-10">
            Ready to stitch your<br />business together?
          </h2>
          <p className="mb-8 relative z-10" style={{ color: '#8b7fa8' }}>
            Join 500+ fashion entrepreneurs already using StitchFlow to run their business.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-white text-base transition-all relative z-10" style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)', boxShadow: '0 8px 28px rgba(233,30,140,0.4)' }}>
            Get Started Free — It's Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10" style={{ background: '#1a1625', borderTop: '1px solid #2d2540' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Image src="/logo.png" alt="StitchFlow" width={40} height={40} className="object-contain" style={{ filter: 'brightness(1.1) drop-shadow(0 1px 3px rgba(233,30,140,0.3))' }} />
            <span className="text-sm font-bold text-white">Stitch<span style={{ color: '#e91e8c' }}>Flow</span></span>
          </div>
          <p className="text-xs" style={{ color: '#4b4568' }}>© 2024 StitchFlow. Built for African Fashion Entrepreneurs.</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Support'].map(l => (
              <Link key={l} href="#" className="text-xs transition-colors text-[#4b4568] hover:text-[#e91e8c]"
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
