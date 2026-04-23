import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager

from models import WorkerInput, ProfileOutput
import score
import profile
import pdf_gen

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("RazgarAI API started")
    yield
    logger.info("RazgarAI API shutdown")


app = FastAPI(title="RazgarAI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "RazgarAI API"}


@app.post("/api/generate", response_model=ProfileOutput)
async def generate_profile(worker: WorkerInput):
    try:
        kaam_score_value, grade = score.calculate_kaam_score(
            worker.years_experience,
            worker.daily_income,
            worker.skill,
            worker.city,
            worker.employer_name
        )
    except Exception as e:
        logger.error(f"Score calculation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate KaamScore")
    
    try:
        profile_data = await profile.generate_profile(worker)
    except ValueError as e:
        error_msg = str(e)
        if "OPENAI_API_KEY not set" in error_msg:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set in .env")
        elif "timeout" in error_msg.lower():
            raise HTTPException(status_code=503, detail="AI service timeout, try again")
        raise HTTPException(status_code=500, detail=f"AI error: {error_msg}")
    except Exception as e:
        logger.error(f"Profile generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate profile")
    
    profile_output = ProfileOutput(
        name=worker.name,
        city=worker.city,
        skill=worker.skill,
        years_experience=worker.years_experience,
        daily_income=worker.daily_income,
        kaam_score=kaam_score_value,
        grade=grade,
        bio=profile_data["bio"],
        skills=profile_data["skills"],
        achievement=profile_data["achievement"],
        trust_statement=profile_data["trust_statement"],
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    
    logger.info(f"Profile generated for {worker.name} — Score: {kaam_score_value}")
    return profile_output


@app.post("/api/download-pdf")
async def download_pdf(profile_data: ProfileOutput):
    try:
        pdf_bytes = pdf_gen.generate_pdf(profile_data)
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
    
    filename = f"RazgarAI_{profile_data.name.replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )