import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/smartpantry")
# Render uses postgres://, but SQLAlchemy 2+ requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
