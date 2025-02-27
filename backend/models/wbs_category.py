# models/wbs_category.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base

class WbsCategory(Base):
    __tablename__ = 'wbs_categories'
    
    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    category_name = Column(String(255), unique=True, nullable=False)
    
    # Relationships
    program = relationship("Program", back_populates="wbs_categories")
    subcategories = relationship("WbsSubcategory", back_populates="category")
    transactions = relationship("LedgerTransaction", back_populates="wbs_category")
