def calculate_kaam_score(
    years_experience: int,
    daily_income: int,
    skill: str,
    city: str,
    employer_name: str
) -> tuple[int, str]:
    
    experience_points = 0
    if 1 <= years_experience <= 2:
        experience_points = 10
    elif 3 <= years_experience <= 5:
        experience_points = 20
    elif 6 <= years_experience <= 10:
        experience_points = 30
    elif years_experience > 10:
        experience_points = 40
    
    income_points = 0
    if daily_income <= 300:
        income_points = 5
    elif daily_income <= 600:
        income_points = 10
    elif daily_income <= 1000:
        income_points = 15
    else:
        income_points = 20
    
    if skill == "Other":
        skill_points = 5
    else:
        skill_points = 15
    
    location_points = 0
    major_cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune"]
    if city in major_cities:
        location_points = 10
    else:
        location_points = 5
    
    if employer_name and employer_name.strip():
        employer_points = 15
    else:
        employer_points = 0
    
    total = experience_points + income_points + skill_points + location_points + employer_points
    total = min(total, 100)
    
    grade = ""
    if total <= 40:
        grade = "Bronze"
    elif total <= 65:
        grade = "Silver"
    elif total <= 85:
        grade = "Gold"
    else:
        grade = "Platinum"
    
    return total, grade