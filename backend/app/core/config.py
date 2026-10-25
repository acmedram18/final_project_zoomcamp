import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/smartpantry")
import os
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
