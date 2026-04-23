import { useEffect, useState } from 'react'

const GRADE_CONFIG = {
  "Bronze": { class: "bronze-gradient", color: "#d97706" },
  "Silver": { class: "silver-gradient", color: "#94a3b8" },
  "Gold": { class: "gold-gradient", color: "#fbbf24" },
  "Platinum": { class: "platinum-gradient", color: "#e2e8f0" }
}

export default function ScoreMeter({ score, grade }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["Silver"]
  
  const radius = 80
  const circumference = Math.PI * radius
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 200 110" className="w-56 h-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (animatedScore / 100) * circumference}
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
          
          <text
            x="100"
            y="90"
            textAnchor="middle"
            className="text-5xl font-black fill-white tracking-tighter"
          >
            {animatedScore}
          </text>
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-10px] text-center">
          <p className="text-[10px] font-bold text-indigo-300/50 uppercase tracking-[0.2em]">KaamScore</p>
        </div>
      </div>
      
      <div className={`mt-4 px-6 py-2 rounded-2xl glass-card border border-white/10 shadow-xl`}>
        <span className={`text-sm font-bold uppercase tracking-widest ${config.class}`}>
          {grade} Grade
        </span>
      </div>
    </div>
  )
}