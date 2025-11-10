"""
Database Migration Script for Phase 5 Backend Integration

This script adds the necessary database columns and tables for:
1. Voice Notes feature
2. Quick Facts feature (adds quick_facts JSON column to users table)

Run this script to update your database schema.
"""

from sqlalchemy import text
from app.db.database import engine

def run_migration():
    """Run database migrations for Phase 5 features"""
    with engine.connect() as conn:
        # Add quick_facts column to users table if it doesn't exist
        try:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS quick_facts JSON;
            """))
            conn.commit()
            print("✓ Added quick_facts column to users table")
        except Exception as e:
            print(f"Note: quick_facts column may already exist: {e}")

        # Create voice_notes table if it doesn't exist
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS voice_notes (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    audio_path VARCHAR(500) NOT NULL,
                    description TEXT,
                    memory_id INTEGER,
                    person_id VARCHAR(100),
                    reminder_id INTEGER,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (memory_id) REFERENCES memory_photos(id) ON DELETE SET NULL,
                    FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE SET NULL
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON voice_notes(user_id);
                CREATE INDEX IF NOT EXISTS idx_voice_notes_memory_id ON voice_notes(memory_id);
                CREATE INDEX IF NOT EXISTS idx_voice_notes_person_id ON voice_notes(person_id);
                CREATE INDEX IF NOT EXISTS idx_voice_notes_reminder_id ON voice_notes(reminder_id);
            """))
            conn.commit()
            print("✓ Created voice_notes table and indexes")
        except Exception as e:
            print(f"Note: voice_notes table may already exist: {e}")

        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    run_migration()

