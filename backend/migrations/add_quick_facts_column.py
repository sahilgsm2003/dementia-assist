"""
SQLite Migration Script to Add quick_facts Column

This script adds the quick_facts column to the users table for SQLite databases.
"""

from sqlalchemy import text, inspect
from app.db.database import engine

def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def run_migration():
    """Run database migration to add quick_facts column"""
    with engine.connect() as conn:
        # Check if column already exists
        if column_exists('users', 'quick_facts'):
            print("[OK] quick_facts column already exists in users table")
            return
        
        # Add quick_facts column to users table
        # SQLite stores JSON as TEXT
        try:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN quick_facts TEXT;
            """))
            conn.commit()
            print("[OK] Added quick_facts column to users table")
        except Exception as e:
            print(f"[ERROR] Error adding quick_facts column: {e}")
            conn.rollback()
            raise
        
        print("\n[SUCCESS] Migration completed successfully!")

if __name__ == "__main__":
    run_migration()

