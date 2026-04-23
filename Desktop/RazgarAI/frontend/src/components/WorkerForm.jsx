import { useState } from 'react'

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", 
  "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Other"
]

const SKILLS = [
  "Carpenter", "Plumber", "Electrician", "Mason", "Welder", 
  "Painter", "Auto Driver", "Tailor", "Cook", "Other"
]

const T = {
  en: {
    name: "Full Name",
    city: "City",
    city_select: "Select your city",
    trade: "Your Trade",
    trade_select: "Select your trade",
    exp: "Years of Experience",
    income: "Daily Income (Rs.)",
    employer: "Employer/Contractor Name",
    employer_sub: "Adding employer name increases your KaamScore",
    submit: "Generate My RazgarAI Profile",
    loading: "Building your profile...",
    placeholder_name: "Ramesh Kumar",
    placeholder_emp: "Optional — adds to your score"
  },
  hi: {
    name: "पूरा नाम",
    city: "शहर",
    city_select: "अपना शहर चुनें",
    trade: "आपका व्यवसाय",
    trade_select: "अपना व्यवसाय चुनें",
    exp: "अनुभव (वर्ष)",
    income: "दैनिक आय (रु.)",
    employer: "नियोक्ता/ठेकेदार का नाम",
    employer_sub: "नियोक्ता का नाम जोड़ने से आपका KaamScore बढ़ता है",
    submit: "मेरा RazgarAI प्रोफाइल बनाएं",
    loading: "आपका प्रोफाइल बन रहा है...",
    placeholder_name: "रमेश कुमार",
    placeholder_emp: "वैकल्पिक - आपके स्कोर में जुड़ता है"
  }
}

export default function WorkerForm({ onSubmit, lang = 'en' }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    skill: '',
    years_experience: 1,
    daily_income: 100,
    employer_name: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_experience' || name === 'daily_income' ? Number(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.city || !formData.skill) {
      alert('Please fill in all required fields')
      return
    }
    setLoading(true)
    onSubmit(formData)
  }

  const inputClass = "w-full px-4 py-3 glass-input rounded-xl focus:outline-none transition-all duration-300"
  const labelClass = "block text-sm font-semibold text-blue-100/70 mb-2"

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className={labelClass}>{T[lang].name}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={T[lang].placeholder_name}
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{T[lang].city}</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="" className="bg-slate-900">{T[lang].city_select}</option>
              {CITIES.map(city => (
                <option key={city} value={city} className="bg-slate-900">{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{T[lang].trade}</label>
            <select
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="" className="bg-slate-900">{T[lang].trade_select}</option>
              {SKILLS.map(skill => (
                <option key={skill} value={skill} className="bg-slate-900">{skill}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            {T[lang].exp}: <span className="text-indigo-400 font-bold">{formData.years_experience} yrs</span>
          </label>
          <input
            type="range"
            name="years_experience"
            min="1"
            max="30"
            value={formData.years_experience}
            onChange={handleChange}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <label className={labelClass}>
            {T[lang].income}: <span className="text-indigo-400 font-bold">₹{formData.daily_income}</span>
          </label>
          <input
            type="range"
            name="daily_income"
            min="100"
            max="2000"
            step="50"
            value={formData.daily_income}
            onChange={handleChange}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <label className={labelClass}>{T[lang].employer}</label>
          <input
            type="text"
            name="employer_name"
            value={formData.employer_name}
            onChange={handleChange}
            placeholder={T[lang].placeholder_emp}
            className={inputClass}
          />
          <p className="text-[10px] text-blue-200/40 mt-2 uppercase tracking-wider font-bold">{T[lang].employer_sub}</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 disabled:opacity-50 group overflow-hidden relative"
      >
        <span className="relative z-10">{loading ? T[lang].loading : T[lang].submit}</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </form>
  )
}