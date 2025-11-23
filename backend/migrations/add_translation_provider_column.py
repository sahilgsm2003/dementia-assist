"""
Database Migration Script for Translation Provider Feature

Adds the translation_provider column to the users table so every user can
store their preferred translation engine (libretranslate, google, deepl).
"""

import sys
from pathlib import Path

# Ensure backend package is importable when running this script directly
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text

from app.db.database import engine


def column_exists(connection, table: str, column: str) -> bool:
    """Return True if the given column exists in the table."""
    result = connection.execute(text(f"PRAGMA table_info({table})"))
    columns = [row[1] for row in result.fetchall()]
    return column in columns


def run_migration():
    """Add translation_provider column if it does not exist."""
    with engine.connect() as conn:
        try:
            if not column_exists(conn, "users", "translation_provider"):
                conn.execute(
                    text(
                        """
                        ALTER TABLE users
                        ADD COLUMN translation_provider VARCHAR(50) DEFAULT 'libretranslate' NOT NULL;
                        """
                    )
                )
                conn.commit()
                print("✓ Added translation_provider column to users table")
            else:
                print("✓ translation_provider column already exists")

            # Ensure existing rows have a value
            conn.execute(
                text(
                    """
                    UPDATE users
                    SET translation_provider = 'libretranslate'
                    WHERE translation_provider IS NULL OR translation_provider = '';
                    """
                )
            )
            conn.commit()
            print("✓ Updated existing rows with default translation provider")
        except Exception as exc:
            print(f"⚠️  Migration failed: {exc}")
            raise

    print("\n✅ Migration completed successfully!")


if __name__ == "__main__":
    run_migration()

