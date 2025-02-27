# models/ledger_transaction.py
from sqlalchemy import Column, Integer, String, Text, Date, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.database.database import Base

class LedgerTransaction(Base):
    __tablename__ = 'ledger_transactions'
    
    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    vendor_name = Column(String(255), nullable=False)
    expense_description = Column(Text, nullable=False)
    # New foreign keys for WBS Category and Subcategory
    wbs_category_id = Column(Integer, ForeignKey("wbs_categories.id"), nullable=True)
    wbs_subcategory_id = Column(Integer, ForeignKey("wbs_subcategories.id"), nullable=True)
    
    baseline_date = Column(Date, nullable = True)
    baseline_amount = Column(DECIMAL(12,2), nullable=True)
    planned_date = Column(Date, nullable=True)
    planned_amount = Column(DECIMAL(12,2), nullable=True)
    actual_date = Column(Date, nullable=True)
    actual_amount = Column(DECIMAL(12,2), nullable=True)
    invoice_link = Column(Text, nullable=True)
    invoice_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    program = relationship("Program", back_populates="transactions")
    wbs_category = relationship("WbsCategory", back_populates="transactions")
    wbs_subcategory = relationship("WbsSubcategory", back_populates="transactions")
