"""
Management command to populate sample courses and lessons.
Usage: python manage.py populate_courses
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.learning.models import Course, Lesson

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample courses and lessons'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample courses...')

        # Get or create instructor
        instructor, _ = User.objects.get_or_create(
            email='instructor@netedu.test',
            defaults={
                'first_name': 'Demo',
                'last_name': 'Instructor',
                'role': 'teacher',
            }
        )
        if not instructor.has_usable_password():
            instructor.set_password('instructor123')
            instructor.save()

        # Course 1: Python for Beginners
        python_course, created = Course.objects.get_or_create(
            title='Python Programming for Beginners',
            instructor=instructor,
            defaults={
                'description': 'Learn Python from scratch! This course covers variables, loops, functions, and basic data structures. Perfect for complete beginners with no prior programming experience.',
                'difficulty': 'beginner',
                'tags': ['python', 'programming', 'beginner'],
                'is_published': True,
                'thumbnail': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
            }
        )

        if created:
            lessons_data = [
                {
                    'title': 'Introduction to Python',
                    'content': 'Python is a powerful, easy-to-learn programming language. It has efficient high-level data structures and a simple but effective approach to object-oriented programming. In this lesson, we will cover: What is Python? Why learn Python? Installing Python on your computer. Your first Python program.',
                    'content_type': 'article',
                    'order': 1,
                    'duration_minutes': 15,
                    'is_free_preview': True,
                },
                {
                    'title': 'Variables and Data Types',
                    'content': 'Variables are containers for storing data values. Python has various data types including: Strings (text), Integers (whole numbers), Floats (decimal numbers), Booleans (True/False). Example: name = "Alice", age = 25, height = 5.6, is_student = True',
                    'content_type': 'article',
                    'order': 2,
                    'duration_minutes': 20,
                    'is_free_preview': True,
                },
                {
                    'title': 'Control Flow: If Statements',
                    'content': 'Control flow allows your program to make decisions. If statements execute code only when a condition is true. Example: if age >= 18: print("You are an adult") else: print("You are a minor")',
                    'content_type': 'article',
                    'order': 3,
                    'duration_minutes': 25,
                },
                {
                    'title': 'Loops: For and While',
                    'content': 'Loops allow you to repeat code multiple times. For loops iterate over sequences. While loops repeat as long as a condition is true. Example: for i in range(5): print(i) # Prints 0,1,2,3,4',
                    'content_type': 'article',
                    'order': 4,
                    'duration_minutes': 30,
                },
                {
                    'title': 'Functions',
                    'content': 'Functions are reusable blocks of code. They help organize your program and avoid repetition. Example: def greet(name): return f"Hello, {name}!" print(greet("Alice")) # Output: Hello, Alice!',
                    'content_type': 'article',
                    'order': 5,
                    'duration_minutes': 35,
                },
            ]

            for lesson_data in lessons_data:
                Lesson.objects.create(course=python_course, **lesson_data)

            self.stdout.write(self.style.SUCCESS(f'✓ Created Python course with {len(lessons_data)} lessons'))

        # Course 2: Web Development Basics
        web_course, created = Course.objects.get_or_create(
            title='Web Development Fundamentals',
            instructor=instructor,
            defaults={
                'description': 'Master the basics of web development! Learn HTML, CSS, and JavaScript to build beautiful, interactive websites. No prior experience needed.',
                'difficulty': 'beginner',
                'tags': ['web', 'html', 'css', 'javascript'],
                'is_published': True,
                'thumbnail': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
            }
        )

        if created:
            lessons_data = [
                {
                    'title': 'Introduction to HTML',
                    'content': 'HTML (HyperText Markup Language) is the foundation of all websites. It defines the structure and content. Basic tags: <html>, <head>, <body>, <h1>, <p>, <a>, <img>. Example: <h1>Welcome</h1> <p>This is a paragraph.</p>',
                    'content_type': 'article',
                    'order': 1,
                    'duration_minutes': 20,
                    'is_free_preview': True,
                },
                {
                    'title': 'Styling with CSS',
                    'content': 'CSS (Cascading Style Sheets) makes websites beautiful. It controls colors, fonts, layouts, and animations. Example: h1 { color: blue; font-size: 32px; } p { margin: 10px; }',
                    'content_type': 'article',
                    'order': 2,
                    'duration_minutes': 25,
                    'is_free_preview': True,
                },
                {
                    'title': 'JavaScript Basics',
                    'content': 'JavaScript adds interactivity to websites. It can respond to user actions, update content dynamically, and much more. Example: document.getElementById("btn").onclick = function() { alert("Button clicked!"); }',
                    'content_type': 'article',
                    'order': 3,
                    'duration_minutes': 30,
                },
                {
                    'title': 'Building Your First Website',
                    'content': 'Let\'s put it all together! Create a simple personal website with: A header with your name, An about section, A contact form, Styled with CSS, Interactive with JavaScript',
                    'content_type': 'article',
                    'order': 4,
                    'duration_minutes': 45,
                },
            ]

            for lesson_data in lessons_data:
                Lesson.objects.create(course=web_course, **lesson_data)

            self.stdout.write(self.style.SUCCESS(f'✓ Created Web Development course with {len(lessons_data)} lessons'))

        # Course 3: Data Science with Python
        ds_course, created = Course.objects.get_or_create(
            title='Data Science with Python',
            instructor=instructor,
            defaults={
                'description': 'Dive into data science! Learn to analyze data, create visualizations, and build machine learning models using Python, Pandas, and Scikit-learn.',
                'difficulty': 'intermediate',
                'tags': ['python', 'data-science', 'pandas', 'machine-learning'],
                'is_published': True,
                'thumbnail': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
            }
        )

        if created:
            lessons_data = [
                {
                    'title': 'Introduction to Data Science',
                    'content': 'Data Science combines statistics, programming, and domain knowledge to extract insights from data. Key skills: Data cleaning, Exploratory analysis, Visualization, Machine learning. Tools: Python, Pandas, NumPy, Matplotlib, Scikit-learn',
                    'content_type': 'article',
                    'order': 1,
                    'duration_minutes': 20,
                    'is_free_preview': True,
                },
                {
                    'title': 'Pandas for Data Analysis',
                    'content': 'Pandas is the most popular Python library for data manipulation. Key concepts: DataFrames (tables), Series (columns), Reading CSV files, Filtering and grouping data. Example: df = pd.read_csv("data.csv") df.groupby("category").mean()',
                    'content_type': 'article',
                    'order': 2,
                    'duration_minutes': 35,
                },
                {
                    'title': 'Data Visualization',
                    'content': 'Visualizations help understand data patterns. Common charts: Line charts (trends), Bar charts (comparisons), Scatter plots (correlations), Histograms (distributions). Libraries: Matplotlib, Seaborn, Plotly',
                    'content_type': 'article',
                    'order': 3,
                    'duration_minutes': 30,
                },
                {
                    'title': 'Machine Learning Basics',
                    'content': 'Machine Learning allows computers to learn from data. Types: Supervised (with labels), Unsupervised (without labels), Reinforcement (learning by trial). Common algorithms: Linear Regression, Decision Trees, K-Means Clustering',
                    'content_type': 'article',
                    'order': 4,
                    'duration_minutes': 40,
                },
            ]

            for lesson_data in lessons_data:
                Lesson.objects.create(course=ds_course, **lesson_data)

            self.stdout.write(self.style.SUCCESS(f'✓ Created Data Science course with {len(lessons_data)} lessons'))

        # Course 4: Network Fundamentals
        network_course, created = Course.objects.get_or_create(
            title='Understanding Internet & Networks',
            instructor=instructor,
            defaults={
                'description': 'Learn how the internet works! Understand bandwidth, latency, protocols, and how network quality affects your online experience.',
                'difficulty': 'beginner',
                'tags': ['networking', 'internet', 'bandwidth'],
                'is_published': True,
                'thumbnail': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
            }
        )

        if created:
            lessons_data = [
                {
                    'title': 'How the Internet Works',
                    'content': 'The internet is a global network of computers. Key concepts: IP addresses (computer identifiers), DNS (domain name system), Packets (data chunks), Routers (traffic directors). When you visit a website, your request travels through multiple routers to reach the server.',
                    'content_type': 'article',
                    'order': 1,
                    'duration_minutes': 25,
                    'is_free_preview': True,
                },
                {
                    'title': 'Understanding Bandwidth and Speed',
                    'content': 'Bandwidth is like a highway - more lanes = more traffic. Download speed: How fast you receive data. Upload speed: How fast you send data. Measured in Mbps (megabits per second). 25 Mbps = good for HD video, 5 Mbps = good for SD video, 1 Mbps = good for browsing',
                    'content_type': 'article',
                    'order': 2,
                    'duration_minutes': 20,
                    'is_free_preview': True,
                },
                {
                    'title': 'Latency and Ping',
                    'content': 'Latency is the delay before data transfer begins. Measured in milliseconds (ms). Low latency (<50ms) = responsive, High latency (>200ms) = laggy. Important for: Video calls, Online gaming, Real-time collaboration',
                    'content_type': 'article',
                    'order': 3,
                    'duration_minutes': 20,
                },
                {
                    'title': 'Improving Your Connection',
                    'content': 'Tips for better internet: Use wired connection (Ethernet) when possible, Position router centrally, Reduce interference (walls, devices), Close unnecessary apps, Test at different times of day, Consider upgrading your plan',
                    'content_type': 'article',
                    'order': 4,
                    'duration_minutes': 25,
                },
            ]

            for lesson_data in lessons_data:
                Lesson.objects.create(course=network_course, **lesson_data)

            self.stdout.write(self.style.SUCCESS(f'✓ Created Network course with {len(lessons_data)} lessons'))

        self.stdout.write(self.style.SUCCESS('\n✅ All sample courses created successfully!'))
        self.stdout.write(f'\nInstructor login: instructor@netedu.test / instructor123')
