export default function RootLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 60%, #1a1625 100%)',
        zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="StitchFlow"
          width={100}
          height={100}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(233,30,140,0.6))',
          }}
        />
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#ffffff',
          }}
        >
          Stitch<span style={{ color: '#e91e8c' }}>Flow</span>
        </span>
      </div>

      {/* Spinner bar */}
      <div
        style={{
          width: '140px',
          height: '3px',
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '50%',
            height: '100%',
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, #e91e8c, #7c3aed)',
            animation: 'shimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.75; }
        }
      `}</style>
    </div>
  )
}
