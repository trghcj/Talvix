from sqlalchemy import create_engine
from sqlalchemy import text
from app.db.models import Base
from app.core.config import settings

db_url = settings.DATABASE_URL.replace('postgres://', 'postgresql://')
engine = create_engine(db_url)

print("Dropping all tables...")
try:
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    print("Schema dropped successfully.")
except Exception as e:
    print(f"Failed to drop schema: {e}")
