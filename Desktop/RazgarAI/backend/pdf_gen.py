import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from models import ProfileOutput


GRADE_COLORS = {
    "Bronze": "#cd7f32",
    "Silver": "#a8a9ad",
    "Gold": "#ffd700",
    "Platinum": "#6c7a89"
}


def generate_pdf(profile: ProfileOutput) -> bytes:
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A5,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    navy = colors.HexColor("#1a1a2e")
    grade_color = colors.HexColor(GRADE_COLORS.get(profile.grade, "#6c7a89"))
    
    left_panel_style = ParagraphStyle(
        'LeftPanel',
        parent=styles['Heading1'],
        textColor=colors.white,
        fontSize=24,
        alignment=TA_CENTER,
        spaceAfter=10
    )
    
    data = [
        [
            Paragraph(f"<b>RazgarAI</b>", left_panel_style),
            ""
        ],
        [
            Paragraph(f"<b>{profile.name}</b>", ParagraphStyle(
                'Name', fontSize=20, textColor=colors.white, alignment=TA_CENTER
            )),
            ""
        ],
        [
            Paragraph(f"{profile.city} • {profile.skill}", ParagraphStyle(
                'Subtitle', fontSize=12, textColor=colors.white, alignment=TA_CENTER
            )),
            ""
        ],
        [
            Paragraph(f"<font size=48><b>{profile.kaam_score}</b></font>", ParagraphStyle(
                'Score', fontSize=48, textColor=grade_color, alignment=TA_CENTER
            )),
            ""
        ],
        [
            Paragraph(f"<b>{profile.grade}</b>", ParagraphStyle(
                'Grade', fontSize=14, textColor=grade_color, alignment=TA_CENTER
            )),
            ""
        ],
        [
            Paragraph("razgarai.in", ParagraphStyle(
                'Footer', fontSize=8, textColor=colors.white, alignment=TA_CENTER
            )),
            ""
        ]
    ]
    
    table = Table(data, colWidths=[2.4*inch, 3.6*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), navy),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 1, navy),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 0.3*inch))
    
    bio_style = ParagraphStyle('Bio', parent=styles['Normal'], fontSize=11, leading=14)
    story.append(Paragraph("VERIFIED WORKER PROFILE", ParagraphStyle(
        'Header', fontSize=12, textColor=navy, spaceAfter=8
    )))
    story.append(Paragraph(profile.bio, bio_style))
    story.append(Spacer(1, 0.2*inch))
    
    skills_text = ", ".join([f"[{s}]" for s in profile.skills])
    story.append(Paragraph(skills_text, ParagraphStyle('Skills', fontSize=9, textColor=navy)))
    story.append(Spacer(1, 0.1*inch))
    
    achievement_text = f"★ {profile.achievement}"
    story.append(Paragraph(achievement_text, ParagraphStyle(
        'Achievement', fontSize=10, textColor=colors.HexColor("#f59e0b"), spaceAfter=6
    )))
    
    trust_style = ParagraphStyle('Trust', parent=styles['Italic'], fontSize=9, textColor=colors.gray)
    story.append(Paragraph(profile.trust_statement, trust_style))
    story.append(Spacer(1, 0.2*inch))
    
    date_str = datetime.now().strftime("%d %b %Y")
    story.append(Paragraph(f"Generated: {date_str}", ParagraphStyle(
        'Date', fontSize=8, textColor=colors.gray
    )))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.read()