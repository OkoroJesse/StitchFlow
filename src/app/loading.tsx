export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF8F5] text-[#1C1917]">
      
      {/* Clean White Card Container for Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-stone-200/90 shadow-md p-4 flex items-center justify-center animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="StitchFlow"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Editorial Brand Name */}
        <div className="text-center">
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#18131d] tracking-tight">
            Stitch<span className="text-[#4a1525]">Flow</span>
          </span>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
            Fashion Workspace
          </p>
        </div>
      </div>

      {/* Sleek Loading Progress Indicator */}
      <div className="mt-8 w-36 h-1 rounded-full bg-stone-200/80 overflow-hidden">
        <div className="w-1/2 h-full rounded-full bg-gradient-to-r from-[#4a1525] to-[#d9467c] animate-[shimmer_1.2s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  )
}
