# Testing Guide — NetEdu

## Philosophy
We test for three things:
1. Correctness — does the feature work as expected
2. Resilience — does the system handle bad/empty/edge 
   case data without crashing
3. Regression safety — if someone changes core logic 
   (scoring, correlation, auth), does a test break 
   and alert them

## Test Structure
Table showing all test files and what they cover:

| File | Classes | Focus |
|------|---------|-------|
| test_api.py | - | Original API tests |
| test_django_style.py | UserAuthTestCase | Auth flows, JWT |
| test_django_style.py | NetworkMeasurementTestCase | CRUD, edge cases |
| test_django_style.py | LearningSystemTestCase | Enrollments, progress |
| test_django_style.py | AnalyticsTestCase | Dashboard, leaderboard |
| test_django_style.py | MockBasedTestCase | Isolated unit tests |
| test_django_style.py | SecurityTestCase | Auth, injection, isolation |
| test_django_style.py | RegressionTestCase | Formula & rule guards |

## Running Tests

### All tests
pytest tests/ -v

### With coverage
pytest tests/ --cov=apps --cov-report=term-missing

### Single class
pytest tests/test_django_style.py::RegressionTestCase -v

### Only edge cases
pytest tests/ -k "edge or EDGE" -v

## Coverage Goals
- Overall target: 70%+ (enforced by --cov-fail-under=70)
- Priority modules: analytics, network, learning
- Deliberately excluded: migrations, admin.py, apps.py

## Coverage Gap Analysis
Explain which modules had the lowest coverage before 
this test suite and why they were prioritized.
Mention that analytics endpoints were most at risk 
because they silently return 500 when no data exists.

## Testing Patterns

### 1. Happy Path
Every endpoint has at least one test for the 
normal expected flow.

### 2. Edge Cases
Every endpoint has tests for:
- Empty/no data scenarios
- Zero values
- Missing related objects (404 vs 500)
- Single item scenarios

### 3. Regression Guards
RegressionTestCase locks in business rules:
- Score formulas
- Ordering stability
- Business rule enforcement (no double enrollment)
- Security rules (token invalidation)

### 4. Mock-Based Isolation
MockBasedTestCase uses unittest.mock to test 
views independently of Pandas/DB operations.

## For Contributors: Adding New Tests
Checklist before submitting a PR:
- [ ] Happy path test added
- [ ] At least one edge case added
- [ ] If you changed a formula/score, update 
      RegressionTestCase expected values
- [ ] Run pytest --cov and check coverage did not drop
- [ ] No new 500 errors introduced for empty data scenarios
