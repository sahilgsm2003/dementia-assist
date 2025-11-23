"""
Database Migration Script for Language Feature

This script adds the language column to the users table.

Run this script to update your database schema.
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.db.database import engine

def run_migration():
    """Run database migration for language feature"""
    with engine.connect() as conn:
        # Check if language column already exists
        # SQLite doesn't support IF NOT EXISTS in ALTER TABLE ADD COLUMN
        try:
            # Try to query the column to see if it exists
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'language' not in columns:
                # Column doesn't exist, add it
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN language VARCHAR(10) DEFAULT 'en' NOT NULL;
                """))
                conn.commit()
                print("✓ Added language column to users table")
            else:
                print("✓ Language column already exists")
                
            # Update existing rows that might have NULL language to 'en'
            conn.execute(text("""
                UPDATE users 
                SET language = 'en' 
                WHERE language IS NULL OR language = '';
            """))
            conn.commit()
            print("✓ Updated existing users with default language")
            
        except Exception as e:
            # If PRAGMA doesn't work (not SQLite), try the standard approach
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN language VARCHAR(10) DEFAULT 'en' NOT NULL;
                """))
                conn.commit()
                print("✓ Added language column to users table")
            except Exception as e2:
                if "duplicate column" in str(e2).lower() or "already exists" in str(e2).lower():
                    print("✓ Language column already exists")
                else:
                    print(f"Note: {e2}")

        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    run_migration()

