"""
Verify database schema - check if quick_facts column exists
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from app.db.database import engine

def check_schema():
    """Check if quick_facts column exists"""
    inspector = inspect(engine)
    try:
        columns = inspector.get_columns('users')
        column_names = [col['name'] for col in columns]
        print("Users table columns:", column_names)
        if 'quick_facts' in column_names:
            print("[SUCCESS] quick_facts column exists!")
            return True
        else:
            print("[ERROR] quick_facts column NOT found")
            return False
    except Exception as e:
        print(f"[ERROR] Could not check schema: {e}")
        return False

if __name__ == "__main__":
    check_schema()

