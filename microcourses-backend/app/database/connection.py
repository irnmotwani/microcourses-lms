from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL — using SQLite for now
DATABASE_URL = "sqlite:///./microcourses.db"

# Create the engine
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a configured "SessionLocal" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# ✅ The missing function
def get_db():
    """
    Dependency that provides a database session to FastAPI routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
