# models/program.py
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Program(Base):
    __tablename__ = 'programs'
    
    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String, unique=True, nullable=False)
    program_code = Column(String(50), unique=True, nullable=False)
    program_description = Column(Text)
    program_status = Column(String(10), nullable=False, default="Active")
    program_manager = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))
    last_edited_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    transactions = relationship("LedgerTransaction", back_populates="program")
    wbs_categories = relationship("WbsCategory", back_populates="program")
