#!/bin/bash
cd backend
PYTHONPATH=. DATABASE_URL=sqlite:///./test.db /Users/angie/Library/Python/3.9/bin/pytest -v

# also support running from root
