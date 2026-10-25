import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/smartpantry")
