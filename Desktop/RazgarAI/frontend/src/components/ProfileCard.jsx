import ScoreMeter from './ScoreMeter'

const T = {
  en: {
    verified: "Verified by RazgarAI",
    skills: "Verified Skills",
    download: "Download PDF Card",
    another: "Generate Another",
    footer: "Share this profile with employers and banks",
    scan: "SCAN TO VERIFY"
  },
  hi: {
    verified: "RazgarAI द्वारा सत्यापित",
    skills: "सत्यापित कौशल",
    download: "PDF कार्ड डाउनलोड करें",
    another: "एक और बनाएं",
    footer: "इस प्रोफाइल को नियोक्ताओं और बैंकों के साथ साझा करें",
    scan: "सत्यापन के लिए स्कैन करें"
  }
}

export default function ProfileCard({ profile, onDownload, onReset, lang = 'en' }) {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `RazgarAI_${profile.name.replace(' ', '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to download PDF: ' + error.message)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="glass-card rounded-[2.5rem] overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <ScoreMeter score={profile.kaam_score} grade={profile.grade} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">{profile.name}</h2>
            <p className="text-blue-200/50 font-medium tracking-wide uppercase text-xs">
              {profile.city} • {profile.skill}
            </p>
            <div className="mt-4 flex justify-center">
              <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                {T[lang].verified}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-blue-50/80 leading-relaxed text-center font-medium">
              "{profile.bio}"
            </p>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <p className="text-[10px] font-black text-blue-200/30 uppercase tracking-[0.2em] mb-4">{T[lang].skills}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.skills.map((skill, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/10">
              <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                {/* Mock QR Code */}
                <div className="w-full h-full border-2 border-slate-900 grid grid-cols-3 grid-rows-3 gap-0.5">
                  <div className="bg-slate-900"></div><div className="bg-slate-900"></div><div className="bg-slate-900"></div>
                  <div className="bg-slate-900"></div><div></div><div className="bg-slate-900"></div>
                  <div className="bg-slate-900"></div><div className="bg-slate-900"></div><div className="bg-slate-900"></div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{T[lang].scan}</p>
                <p className="text-[9px] text-indigo-300/50">REF: RAZ-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-amber-400 font-black text-sm tracking-tighter italic">
                  ★ {profile.achievement}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-indigo-500/10 uppercase tracking-widest text-sm"
        >
          {T[lang].download}
        </button>
        <button
          onClick={onReset}
          className="w-full py-4 glass-card text-white/70 font-bold rounded-2xl hover:bg-white/5 transition-all duration-300 uppercase tracking-widest text-sm"
        >
          {T[lang].another}
        </button>
      </div>

      <p className="text-center text-[10px] text-blue-200/30 font-bold uppercase tracking-[0.2em] pb-8">
        {T[lang].footer}
      </p>
    </div>
  )
}