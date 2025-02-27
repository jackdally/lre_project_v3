# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# For development, we use SQLite. Later, you can change this to PostgreSQL for production.
DATABASE_URL = "sqlite:///./lre_project_v3.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}  # This flag is required for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy.orm import declarative_base
Base = declarative_base()
