import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/smartpantry")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SERPER_API_KEY = os.getenv("SERPER_API_KEY", "7d8658b12699a8ce5b91d43be5d51a1f1ed54333")
