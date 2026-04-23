# RazgarAI 🔨

50 million skilled workers in India are invisible to the formal economy. RazgarAI changes that.

## The Problem

- 400M+ informal workers in India have no formal identity
- No documents = no bank accounts, no loans, no verification
- Money lenders charge 30-60% interest because there's no credit history
- Workers have skills but can't prove it

**RazgarAI** creates a professional identity in 2 minutes. No documents. No bank account. No paperwork.

## How It Works

**Step 1:** Fill your work details (2 minutes)
- Name, city, trade, experience, daily income
- Optional employer name for extra trust

**Step 2:** AI generates your profile
- KaamScore (0-100 trust score)
- Professional bio written by AI
- Verified skills list
- Achievement highlight

**Step 3:** Download your PDF card
- Share with employers and banks
- Use for loan applications
- Your LinkedIn without the internet

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI + Python 3.11 |
| AI | OpenAI GPT-4o-mini |
| PDF | ReportLab |

## Setup in 5 Minutes

### 1. Clone and enter directory
```bash
git clone https://github.com/yourusername/razgarai.git
cd razgarai
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp ../.env.example .env
# Edit .env and paste your OPENAI_API_KEY
```

### 3. Run Backend
```bash
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### 4. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### 5. Open Browser
Go to **http://localhost:5173**

## Live Demo

_Coming soon at razgarai.vercel.app_

## Roadmap

- [ ] WhatsApp bot integration
- [ ] Employer verification system
- [ ] Bank/NBFC API integration
- [ ] Hindi language support
- [ ] KaamScore history tracking
- [ ] QR code on PDF for instant verification

## Why This Matters

For 400 million workers in India, RazgarAI isn't an app — it's their LinkedIn, their credit score, and their proof of identity. All in their pocket.

## License

MIT License

---

Built with ❤️ for India's workers