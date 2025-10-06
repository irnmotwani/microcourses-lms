import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Read DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in environment variables!")

# ✅ Create SQLAlchemy Engine for Production (Neon + Render)
# pool_pre_ping = ensures old connections are refreshed automatically
# pool_recycle = recreates connection every 30 minutes (to prevent timeout)
# connect_args = enforces SSL for Neon PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={"sslmode": "require"},
)

# ✅ Create a configured SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class for all database models
Base = declarative_base()

# ✅ Dependency for FastAPI routes to get DB session
def get_db():
    """
    Provides a database session for routes.
    Automatically closes the session after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
