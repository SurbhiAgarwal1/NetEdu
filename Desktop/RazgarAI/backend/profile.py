import os
import json
from openai import AsyncOpenAI, OpenAIError
from models import WorkerInput


async def generate_profile(worker: WorkerInput) -> dict:
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Fallback to Mock Data if API Key is missing (for demo/testing)
    if not api_key or api_key == "YOUR_OPENAI_API_KEY":
        return {
            "bio": f"{worker.name} is a highly skilled {worker.skill} from {worker.city} with {worker.years_experience} years of hands-on experience. Known for exceptional craftsmanship and reliability in all local projects.",
            "skills": [f"Expert {worker.skill}", "Material Management", "Technical Troubleshooting"],
            "achievement": f"Completed over {worker.years_experience * 5}+ major contracts with 100% on-time delivery.",
            "trust_statement": f"A trusted professional in the {worker.city} work community with a proven history of integrity."
        }

    client = AsyncOpenAI(api_key=api_key)
    
    employer_display = worker.employer_name if worker.employer_name else "Self-employed"
    
    system_prompt = """You are a professional profile writer for blue-collar 
workers in India. Write with dignity and warmth. Your writing 
makes workers sound competent and trustworthy. Never use generic 
phrases. Be specific to their trade and experience."""
    
    user_prompt = f"""Generate a professional profile for this worker:
Name: {worker.name}
Trade: {worker.skill}
City: {worker.city}
Experience: {worker.years_experience} years
Daily income: Rs. {worker.daily_income}
Employer: {employer_display}

Return ONLY valid JSON with these exact keys:
{{
    "bio": "2 sentence professional bio in third person, specific to their trade",
    "skills": ["skill1", "skill2", "skill3"],
    "achievement": "One specific achievement line based on their experience years",
    "trust_statement": "One line for lenders/employers about why this worker is reliable"
}}

Rules:
- bio must mention their specific trade and city
- skills must be real trade skills, not soft skills
- achievement must include a number (years, projects, etc)
- trust_statement must be specific, not generic
- Return pure JSON only, no markdown, no explanation"""
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        profile_data = json.loads(content)
        
        return {
            "bio": profile_data.get("bio", ""),
            "skills": profile_data.get("skills", []),
            "achievement": profile_data.get("achievement", ""),
            "trust_statement": profile_data.get("trust_statement", "")
        }
        
    except OpenAIError as e:
        if "timeout" in str(e).lower() or "rate limit" in str(e).lower():
            raise ValueError("AI service timeout, try again")
        raise ValueError(f"AI service error: {str(e)}")