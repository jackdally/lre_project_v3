# models/edit_history.py
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from datetime import datetime, timezone
from database.database import Base

class EditHistory(Base):
    __tablename__ = 'edit_history'
    
    id = Column(Integer, primary_key=True, index=True)
    edited_by = Column(String(255), nullable=False)
    edited_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))
    field_changed = Column(String(255), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)
    record_id = Column(Integer, nullable=False)  # ID of the record changed
    table_name = Column(String(50), nullable=False)
