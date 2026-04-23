import { useState } from 'react'
import axios from 'axios'
import WorkerForm from './components/WorkerForm'
import ProfileCard from './components/ProfileCard'
import LoadingState from './components/LoadingState'


export default function App() {
  const [view, setView] = useState('form')
  const [profileData, setProfileData] = useState(null)
  const [lang, setLang] = useState('en')

  const handleSubmit = async (formData) => {
    setView('loading')
    
    try {
      const response = await axios.post('/api/generate', formData)
      setProfileData(response.data)
      setView('result')
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Something went wrong'
      alert(message)
      setView('form')
    }
  }

  const handleReset = () => {
    setProfileData(null)
    setView('form')
  }

  const translations = {
    en: { title: "RazgarAI", sub: "Your Digital Work Identity", toggle: "हिंदी" },
    hi: { title: "रोजगार AI", sub: "आपकी डिजिटल पहचान", toggle: "English" }
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-outfit">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-lg mx-auto py-12 px-4 relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {translations[lang].title} <span className="animate-float text-3xl">🔨</span>
            </h1>
            <p className="text-blue-200/60 font-medium">{translations[lang].sub}</p>
          </div>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-4 py-2 glass-card rounded-full text-sm font-semibold hover:bg-white/10 transition"
          >
            {translations[lang].toggle}
          </button>
        </header>

        {view === 'form' && (
          <div className="animate-fade-up">
            <WorkerForm onSubmit={handleSubmit} lang={lang} />
          </div>
        )}

        {view === 'loading' && <LoadingState lang={lang} />}

        {view === 'result' && profileData && (
          <ProfileCard 
            profile={profileData} 
            onDownload={() => {}}
            onReset={handleReset}
            lang={lang}
          />
        )}
      </div>
    </div>
  )
}