import React from 'react'

export function HeroBackground3D() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes infiniteGridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 50px;
          }
        }

        @keyframes particleFly1 {
          0% {
            transform: translateY(0px) scale(0.8) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-80px) scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-160px) scale(0.8) rotate(360deg);
            opacity: 0.2;
          }
        }

        @keyframes particleFly2 {
          0% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(60px) scale(1.4) rotate(-90deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(120px) scale(1) rotate(-180deg);
            opacity: 0.3;
          }
        }

        .infinite-3d-grid {
          animation: infiniteGridMove 1.5s linear infinite;
        }

        .particle-fly-1 {
          animation: particleFly1 6s ease-in-out infinite;
        }

        .particle-fly-2 {
          animation: particleFly2 8s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient glowing gradient orbs */}
      <div className="absolute -top-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-purple-500/15 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute -bottom-24 left-1/3 w-[26rem] h-[26rem] rounded-full bg-blue-500/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />


      {/* Infinite 3D Moving Perspective Grid */}
      <div
        className="infinite-3d-grid absolute inset-0 opacity-[0.25] dark:opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(400px) rotateX(65deg) translateY(-80px) scale(2.8)',
          transformOrigin: 'top center',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 50%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 50%, transparent 85%)',
        }}
      />

      {/* Moving 3D Cubes & Particles */}
      <div className="particle-fly-1 absolute top-20 left-[12%] w-4 h-4 rounded-md bg-primary/50 shadow-lg shadow-primary/30 border border-primary/40" />
      <div className="particle-fly-2 absolute top-1/2 right-[15%] w-5 h-5 rounded-md bg-purple-500/40 shadow-lg shadow-purple-500/30 border border-purple-400/40" />
      <div className="particle-fly-1 absolute bottom-24 left-[22%] w-3 h-3 rounded bg-blue-400/50 shadow-lg shadow-blue-400/30" style={{ animationDelay: '-2s' }} />
      <div className="particle-fly-2 absolute top-1/4 right-[28%] w-3.5 h-3.5 rounded bg-indigo-400/50 shadow-lg shadow-indigo-400/30" style={{ animationDelay: '-4s' }} />
    </div>
  )
}
