"""
Verify reminders table schema - check if reminder_type and trigger_conditions columns exist
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from app.db.database import engine

def check_reminders_schema():
    """Check if reminder_type and trigger_conditions columns exist"""
    inspector = inspect(engine)
    try:
        columns = inspector.get_columns('reminders')
        column_names = [col['name'] for col in columns]
        print("Reminders table columns:", column_names)
        
        required_columns = ['reminder_type', 'trigger_conditions']
        missing = [col for col in required_columns if col not in column_names]
        
        if not missing:
            print("[SUCCESS] All required columns exist!")
            return True
        else:
            print(f"[ERROR] Missing columns: {missing}")
            return False
    except Exception as e:
        print(f"[ERROR] Could not check schema: {e}")
        return False

if __name__ == "__main__":
    check_reminders_schema()

