import { useState, useEffect } from 'react'

const T = {
  en: {
    title: "RazgarAI",
    sub: "Building your professional profile...",
    steps: [
      "Calculating your KaamScore",
      "Writing your profile",
      "Preparing your card"
    ]
  },
  hi: {
    title: "रोजगार AI",
    sub: "आपका प्रोफेशनल प्रोफाइल बन रहा है...",
    steps: [
      "आपका KaamScore गिना जा रहा है",
      "आपका प्रोफाइल लिखा जा रहा है",
      "आपका कार्ड तैयार हो रहा है"
    ]
  }
}

export default function LoadingState({ lang = 'en' }) {
  const [visibleSteps, setVisibleSteps] = useState([])
  const steps = T[lang].steps

  useEffect(() => {
    steps.forEach((_, index) => {
      setTimeout(() => {
        setVisibleSteps(prev => [...prev, index])
      }, (index + 1) * 800)
    })
  }, [lang])

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-sm w-full">
        <div className="mb-8 relative inline-block">
          <h1 className="text-5xl font-black text-white animate-pulse">
            {T[lang].title} <span className="animate-float inline-block">🔨</span>
          </h1>
          <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl -z-10 rounded-full" />
        </div>
        
        <p className="text-blue-200/60 font-medium mb-10 tracking-wide uppercase text-xs">
          {T[lang].sub}
        </p>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-4 transition-all duration-500 transform ${
                visibleSteps.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-10 -translate-x-4'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                visibleSteps.includes(index) 
                  ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                  : 'bg-white/5 border border-white/10'
              }`}>
                {visibleSteps.includes(index) ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                )}
              </div>
              <span className={`text-sm font-bold tracking-tight ${
                visibleSteps.includes(index) ? 'text-white' : 'text-white/20'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-[2400ms] ease-linear"
              style={{ width: visibleSteps.length === steps.length ? '100%' : `${(visibleSteps.length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}