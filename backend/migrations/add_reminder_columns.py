"""
SQLite Migration Script to Add Missing Columns to Reminders Table

This script adds the reminder_type and trigger_conditions columns to the reminders table.
"""

from sqlalchemy import text, inspect
from app.db.database import engine

def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    try:
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception:
        return False

def run_migration():
    """Run database migration to add missing columns to reminders table"""
    with engine.connect() as conn:
        # Add reminder_type column if it doesn't exist
        if not column_exists('reminders', 'reminder_type'):
            try:
                conn.execute(text("""
                    ALTER TABLE reminders 
                    ADD COLUMN reminder_type VARCHAR(20) DEFAULT 'time' NOT NULL;
                """))
                conn.commit()
                print("[OK] Added reminder_type column to reminders table")
            except Exception as e:
                print(f"[ERROR] Error adding reminder_type column: {e}")
                conn.rollback()
                raise
        else:
            print("[OK] reminder_type column already exists")
        
        # Add trigger_conditions column if it doesn't exist
        if not column_exists('reminders', 'trigger_conditions'):
            try:
                # SQLite stores JSON as TEXT
                conn.execute(text("""
                    ALTER TABLE reminders 
                    ADD COLUMN trigger_conditions TEXT;
                """))
                conn.commit()
                print("[OK] Added trigger_conditions column to reminders table")
            except Exception as e:
                print(f"[ERROR] Error adding trigger_conditions column: {e}")
                conn.rollback()
                raise
        else:
            print("[OK] trigger_conditions column already exists")
        
        print("\n[SUCCESS] Migration completed successfully!")

if __name__ == "__main__":
    run_migration()

