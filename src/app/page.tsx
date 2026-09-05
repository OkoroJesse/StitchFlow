import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle2,
  Scissors,
  Users,
  BarChart3,
  FileText,
  Star,
  Ruler,
  Calendar,
  Sparkles,
  Layers,
  Clock,
  Shirt,
  MessageSquare
} from 'lucide-react'

export const metadata = {
  title: 'StitchFlow — The Operating System for Fashion Businesses',
  description: 'Organize customers, body measurements, project workflows, delivery dates, invoices, and client feedback in one professional fashion workspace.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans selection:bg-[#4a1525] selection:text-white">

      {/* ─── 1. NAVIGATION BAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#18131d] p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="StitchFlow" width={32} height={32} className="object-contain filter brightness-200 invert" />
              </div>
              {/* Desktop text brand; hidden on mobile viewport per specification */}
              <span className="hidden md:inline font-serif text-2xl font-bold text-[#18131d] tracking-tight">
                Stitch<span className="text-[#4a1525]">Flow</span>
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-sm font-medium text-stone-600 hover:text-[#4a1525] transition-colors">
                Why StitchFlow
              </a>
              <a href="#workflow" className="text-sm font-medium text-stone-600 hover:text-[#4a1525] transition-colors">
                Workflow
              </a>
              <a href="#features" className="text-sm font-medium text-stone-600 hover:text-[#4a1525] transition-colors">
                Capabilities
              </a>
              <a href="#pricing" className="text-sm font-medium text-stone-600 hover:text-[#4a1525] transition-colors">
                Pricing
              </a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#4a1525] px-3 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white px-4 sm:px-5 py-2.5 rounded-full bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-sm active:scale-95"
              >
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-[#fbf0f3] border border-[#fbcfe0]">
                <Sparkles className="w-3.5 h-3.5 text-[#d9467c]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d9467c]">
                  THE WORKFLOW PLATFORM FOR FASHION BUSINESSES
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.12] text-[#18131d]">
                Stop Running Your Fashion Business From <span className="italic text-[#4a1525]">WhatsApp, Notebooks &amp; Memory.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                StitchFlow gives tailors, fashion designers, and ateliers one organized workspace to manage client profiles, body measurements, project pipelines, style references, delivery dates, invoices, and customer feedback.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full text-white text-sm sm:text-base bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full text-[#18131d] bg-white border border-stone-300 text-sm sm:text-base hover:bg-stone-50 transition-all shadow-xs"
                >
                  See How It Works
                </a>
              </div>

              {/* Anchor Value Badges */}
              <div className="pt-8 border-t border-stone-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-left">
                  <div className="text-xs font-bold text-[#18131d] uppercase tracking-wider">Client CRM</div>
                  <div className="text-xs text-stone-500 mt-0.5">Versioned measurements</div>
                </div>
                <div className="text-left border-l border-stone-200 pl-4">
                  <div className="text-xs font-bold text-[#18131d] uppercase tracking-wider">Job Pipeline</div>
                  <div className="text-xs text-stone-500 mt-0.5">Cutting to delivery</div>
                </div>
                <div className="text-left border-l border-stone-200 pl-4">
                  <div className="text-xs font-bold text-[#18131d] uppercase tracking-wider">Invoicing</div>
                  <div className="text-xs text-stone-500 mt-0.5">Deposit &amp; balance tracking</div>
                </div>
              </div>

            </div>

            {/* Hero Right Visual: Authentic Product Snapshot */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xl space-y-5 relative">
                
                {/* Header snippet */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4a1525] text-white flex items-center justify-center font-serif font-bold text-sm">
                      CA
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">Chief Adebayo</h4>
                      <p className="text-[11px] text-stone-500">Client Profile • 4 Projects</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                    Cutting Stage
                  </span>
                </div>

                {/* Project Card */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18131d]">Custom 3-Piece Senator Wear</span>
                    <span className="text-[10px] font-mono font-bold text-[#4a1525]">#JOB-2026-08</span>
                  </div>
                  
                  {/* Style Details */}
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/60">
                    <Shirt className="w-4 h-4 text-[#d9467c] flex-shrink-0" />
                    <span>Fabric: Italian Wool Blend (Navy Blue)</span>
                  </div>

                  {/* Measurement Breakdown Pills */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200/60">
                      <div className="text-stone-400 font-bold uppercase">Chest</div>
                      <div className="font-bold text-stone-900">42 in</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200/60">
                      <div className="text-stone-400 font-bold uppercase">Waist</div>
                      <div className="font-bold text-stone-900">36 in</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200/60">
                      <div className="text-stone-400 font-bold uppercase">Shoulder</div>
                      <div className="font-bold text-stone-900">18.5 in</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200/60">
                      <div className="text-stone-400 font-bold uppercase">Length</div>
                      <div className="font-bold text-stone-900">38 in</div>
                    </div>
                  </div>

                  {/* Delivery Pill */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Fitting Date: <strong className="text-stone-900">Sept 12, 2026</strong></span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      Deposit Paid
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>Project Progress</span>
                  <span className="font-bold text-[#18131d]">2 of 5 Steps Complete</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#4a1525] h-full rounded-full w-2/5" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. PROBLEM SECTION ─── */}
      <section id="problem" className="py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              THE BUSINESS REALITY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#18131d] mt-2 mb-4">
              Your Craft Is Organized. Your Workflow Should Be Too.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Most fashion businesses manage high-value client garments using tools never built for fashion — leading to costly mistakes and constant stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* The Old Way */}
            <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-stone-200/80 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  ✕
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">Managing via WhatsApp &amp; Paper</h3>
              </div>

              <ul className="space-y-4 text-sm text-stone-600">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Lost &amp; Mixed Measurements:</strong> Searching through months of chat logs or paper notebooks to find a client's neck or waist size.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Forgotten Deadlines:</strong> Overpromising delivery dates without a central production schedule.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Fabric Confusion:</strong> Mixing up client fabric cuts and style screenshot references stored in your phone gallery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Unclear Payments:</strong> Disagreements over initial deposits and outstanding balances at fitting time.</span>
                </li>
              </ul>
            </div>

            {/* The StitchFlow Way */}
            <div className="bg-[#18131d] text-white rounded-3xl p-8 border border-stone-800 space-y-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                  ✓
                </div>
                <h3 className="font-serif text-xl font-bold text-white">The StitchFlow System</h3>
              </div>

              <ul className="space-y-4 text-sm text-stone-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#d9467c] font-bold">•</span>
                  <span><strong>Structured Body Profiles:</strong> Versioned measurement records for Men &amp; Women grouped by garment type (Senators, Suits, Dresses).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d9467c] font-bold">•</span>
                  <span><strong>Clear Job Pipeline:</strong> Track garments stage by stage from Pending → Cutting → Sewing → Fitting → Delivery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d9467c] font-bold">•</span>
                  <span><strong>Linked Fabric References:</strong> Fabric notes and inspiration images attached directly to the specific project.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#d9467c] font-bold">•</span>
                  <span><strong>Professional Invoices:</strong> Instant invoice generation showing deposit payments and clear balances.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. SOLUTION & WORKFLOW PIPELINE ─── */}
      <section id="workflow" className="py-20 sm:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              END-TO-END FASHION PIPELINE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#18131d] mt-2 mb-4">
              Everything Your Fashion Business Needs. In One Workspace.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              A structured workflow guiding every customer order from intake to final review.
            </p>
          </div>

          {/* Horizontal Step Pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { step: '01', title: 'Customer', desc: 'Profile & contact', icon: Users },
              { step: '02', title: 'Measurements', desc: 'Garment specs', icon: Ruler },
              { step: '03', title: 'Project', desc: 'Job creation', icon: Scissors },
              { step: '04', title: 'Fabric & Style', desc: 'Attachments', icon: Layers },
              { step: '05', title: 'Production', desc: 'Cutting & sewing', icon: Shirt },
              { step: '06', title: 'Fitting', desc: 'Appointments', icon: Calendar },
              { step: '07', title: 'Invoice', desc: 'Deposit & balance', icon: FileText },
              { step: '08', title: 'Review', desc: 'Client feedback', icon: MessageSquare },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-[#4a1525]/40 transition-colors"
              >
                <div>
                  <div className="text-[10px] font-mono font-bold text-[#d9467c] mb-2">{step}</div>
                  <Icon className="w-5 h-5 text-[#4a1525] mb-2" />
                  <h4 className="font-serif text-xs font-bold text-[#18131d]">{title}</h4>
                </div>
                <p className="text-[10px] text-stone-500 mt-1 leading-tight">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 5. REAL PRODUCT CAPABILITIES ─── */}
      <section id="features" className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              CORE SYSTEM CAPABILITIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#18131d] mt-2 mb-4">
              Purpose-built tools for tailors &amp; designers
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Every tool in StitchFlow is designed specifically around how fashion ateliers operate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Customer Directory &amp; History</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Maintain comprehensive customer profiles with contact info, style preferences, project history, and total spending records.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Body Measurement Engine</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Categorized measurement profiles for Men and Women (Senators, Agbada, Suits, Dresses, Gowns). Update and reuse across future orders.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Project Pipeline Tracking</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Track each outfit through production stages: Pending, Cutting, Sewing, Fitting, Ready, and Delivered.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Fabric &amp; Style References</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Attach fabric notes, lining choices, and design inspiration photos directly to the client's project workspace.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Invoicing &amp; Deposit Records</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Generate clean, shareable invoices with itemized charges, initial deposit tracking, and remaining balances due.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-stone-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#4a1525] text-white flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18131d]">Client Feedback &amp; Reviews</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Share private review links after outfit delivery to collect star ratings and client testimonials for your brand.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. BUILT FOR FASHION ─── */}
      <section className="py-20 bg-[#18131d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
                TAILORED FOR FASHION BUSINESSES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold leading-tight">
                Built around the way fashion businesses actually work.
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Whether you run a solo tailoring workshop or manage a multi-designer fashion atelier, StitchFlow adapts to your exact workflow.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {[
                { title: 'Bespoke Tailors', desc: 'Men & Women custom wear' },
                { title: 'Fashion Designers', desc: 'Collection & custom outfits' },
                { title: 'Bridal Ateliers', desc: 'Wedding gowns & entourage' },
                { title: 'Senator Specialists', desc: 'Traditional & native wear' },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-[#241e2b] p-5 rounded-2xl border border-stone-800 space-y-1">
                  <h4 className="font-serif text-sm font-bold text-white">{title}</h4>
                  <p className="text-[11px] text-stone-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ─── 7. HOW IT WORKS (4 STEPS) ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              SIMPLE 4-STEP SYSTEM
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#18131d] mt-2 mb-4">
              How StitchFlow Fits Into Your Day
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Get started in under 2 minutes without changing your craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Add Your Customer', desc: 'Create a client profile with phone, email, and style notes.' },
              { step: '02', title: 'Record Measurements', desc: 'Input categorized body measurements saved to their profile.' },
              { step: '03', title: 'Track Project Pipeline', desc: 'Update progress from cutting to fitting and completion.' },
              { step: '04', title: 'Invoice & Collect Review', desc: 'Send a professional invoice and collect client feedback.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative">
                <div className="font-mono text-xs font-bold text-[#d9467c] mb-3">{step}</div>
                <h3 className="font-serif text-base font-bold text-[#18131d] mb-2">{title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 8. PRICING PREVIEW ─── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
            TRANSPARENT PRICING
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#18131d] mt-2 mb-4">
            Simple Monthly Plans for Every Studio Size
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mb-16">
            All prices in Nigerian Naira (₦). No hidden charges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            
            {/* Basic Plan */}
            <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Basic Plan</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-serif text-3xl font-extrabold text-[#18131d]">₦3,000</span>
                  <span className="text-xs text-stone-500">/month</span>
                </div>
                <p className="text-xs text-stone-600 mb-6">Essential tools for solo tailors</p>
                
                <div className="space-y-3 mb-8 text-xs text-stone-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Up to 15 client profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>10 active projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Body measurement engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Invoice generator</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=basic"
                className="w-full block text-center py-3 rounded-full text-xs font-bold bg-white text-[#18131d] border border-stone-300 hover:bg-stone-50 transition-all"
              >
                Start Basic Plan
              </Link>
            </div>

            {/* Designer Pro (Recommended) */}
            <div className="bg-[#18131d] text-white rounded-3xl p-8 border-2 border-[#4a1525] shadow-xl flex flex-col justify-between relative scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4a1525] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#d9467c] mb-2">Designer Pro</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-serif text-3xl font-extrabold text-white">₦7,000</span>
                  <span className="text-xs text-stone-400">/month</span>
                </div>
                <p className="text-xs text-stone-300 mb-6">For growing boutique studios</p>

                <div className="space-y-3 mb-8 text-xs text-stone-200 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d9467c]" />
                    <span>Up to 50 client profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d9467c]" />
                    <span>30 active projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d9467c]" />
                    <span>Full measurement engine &amp; history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d9467c]" />
                    <span>Client review links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d9467c]" />
                    <span>Studio analytics dashboard</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=designer"
                className="w-full block text-center py-3 rounded-full text-xs font-bold bg-[#4a1525] text-white hover:bg-[#5c1d30] transition-all shadow-md"
              >
                Start Designer Pro
              </Link>
            </div>

            {/* Fashion Studio */}
            <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Fashion Studio</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-serif text-3xl font-extrabold text-[#18131d]">₦25,000</span>
                  <span className="text-xs text-stone-500">/month</span>
                </div>
                <p className="text-xs text-stone-600 mb-6">For large design houses &amp; ateliers</p>

                <div className="space-y-3 mb-8 text-xs text-stone-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Unlimited client profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Unlimited active projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Custom branding on invoices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a1525]" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=studio"
                className="w-full block text-center py-3 rounded-full text-xs font-bold bg-white text-[#18131d] border border-stone-300 hover:bg-stone-50 transition-all"
              >
                Start Fashion Studio
              </Link>
            </div>

          </div>

          <div className="mt-8 text-xs text-stone-500">
            Need custom enterprise support? <Link href="/register?plan=studio" className="text-[#4a1525] font-bold underline">Contact sales</Link>
          </div>

        </div>
      </section>

      {/* ─── 9. FAQ SECTION ─── */}
      <section className="py-20 bg-[#FAF8F5] border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">QUESTIONS &amp; ANSWERS</span>
            <h2 className="font-serif text-3xl font-black text-[#18131d] mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              {
                q: 'Can I install StitchFlow on my phone?',
                a: 'Yes. StitchFlow is a full Progressive Web App (PWA). You can install it right to your smartphone home screen for fast mobile access.'
              },
              {
                q: 'How does measurement tracking work?',
                a: 'You can save structured body profiles for Men and Women grouped by garment category. Measurements are saved to the client record and can be updated over time.'
              },
              {
                q: 'Does StitchFlow handle customer payments?',
                a: 'StitchFlow generates professional invoices with deposit and balance tracking. Actual client payments are made via your preferred channels (bank transfer, cash, etc.).'
              },
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes. You can upgrade or adjust your subscription anytime from your Studio Settings.'
              }
            ].map(({ q, a }) => (
              <div key={q} className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="font-serif text-sm font-bold text-[#18131d]">{q}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. FINAL CTA BANNER ─── */}
      <section className="py-20 bg-[#18131d] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            Ready to bring order to your fashion business?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-lg mx-auto">
            Create your fashion workspace in under two minutes. Free trial included.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-white text-sm sm:text-base bg-[#4a1525] hover:bg-[#5c1d30] transition-all shadow-lg active:scale-95"
            >
              Get Started Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 11. FOOTER ─── */}
      <footer className="py-12 bg-[#100d14] text-white border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4a1525] flex items-center justify-center text-white font-serif font-bold text-xs">
              SF
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-white">
              Stitch<span className="text-[#d9467c]">Flow</span>
            </span>
          </div>

          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} StitchFlow. The Operating System for Fashion Businesses.
          </p>

          <div className="flex gap-6 text-xs text-stone-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
