# models/wbs_subcategory.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base

class WbsSubcategory(Base):
    __tablename__ = 'wbs_subcategories'
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("wbs_categories.id"), nullable=False)
    subcategory_name = Column(String(255), nullable=False)
    
    # Relationships
    category = relationship("WbsCategory", back_populates="subcategories")
    transactions = relationship("LedgerTransaction", back_populates="wbs_subcategory")
