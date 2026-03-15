"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(#CCFF00 1px, transparent 1px),
            linear-gradient(90deg, #CCFF00 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scan Lines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          {/* Outer Ring */}
          <div
            className="w-24 h-24 border-4 border-[#CCFF00]/30 animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* Inner Ring - Counter Spin */}
          <div
            className="absolute inset-2 border-4 border-t-[#CCFF00] border-r-transparent border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: "1s" }}
          />

          {/* Center Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-4 h-4 bg-[#CCFF00] animate-pulse"
              style={{
                boxShadow: "0 0 20px #CCFF00, 0 0 40px #CCFF00",
                animationDuration: "0.8s",
              }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[#CCFF00] text-xl tracking-[0.3em] uppercase">
            <span className="animate-pulse" style={{ animationDelay: "0ms" }}>
              L
            </span>
            <span className="animate-pulse" style={{ animationDelay: "100ms" }}>
              O
            </span>
            <span className="animate-pulse" style={{ animationDelay: "200ms" }}>
              A
            </span>
            <span className="animate-pulse" style={{ animationDelay: "300ms" }}>
              D
            </span>
            <span className="animate-pulse" style={{ animationDelay: "400ms" }}>
              I
            </span>
            <span className="animate-pulse" style={{ animationDelay: "500ms" }}>
              N
            </span>
            <span className="animate-pulse" style={{ animationDelay: "600ms" }}>
              G
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-48 h-1 bg-[#1a1a1a] border border-[#CCFF00]/30 overflow-hidden">
            <div
              className="h-full bg-[#CCFF00] animate-loading-bar"
              style={{
                animation: "loading-bar 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Decorative Corner Brackets */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-[#CCFF00]" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-[#CCFF00]" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-4 border-b-4 border-[#CCFF00]" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-[#CCFF00]" />
      </div>

      {/* Inline Keyframes */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 100%;
            margin-left: 0%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  )
}
