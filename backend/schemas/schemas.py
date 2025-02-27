# schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime, date
from decimal import Decimal

# --- Program Schemas (existing) ---
class ProgramBase(BaseModel):
    program_name: str
    program_code: str
    program_description: Optional[str] = None
    program_status: str = "Active"
    program_manager: str

class ProgramCreate(ProgramBase):
    pass

class Program(ProgramBase):
    id: int
    created_at: datetime
    last_edited_at: datetime

    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic V2

# --- Ledger Transaction Schemas ---
class LedgerTransactionBase(BaseModel):
    program_id: int
    vendor_name: str
    expense_description: str
    wbs_category_id: Optional[int] = None 
    wbs_subcategory_id: Optional[int] = None 
    baseline_date: Optional[date] = None
    baseline_amount: Optional[Decimal] = None
    planned_date: Optional[date] = None
    planned_amount: Optional[Decimal] = None
    actual_date: Optional[date] = None
    actual_amount: Optional[Decimal] = None
    invoice_link: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class LedgerTransactionCreate(LedgerTransactionBase):
    pass

class LedgerTransaction(LedgerTransactionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- WBS Category Schemas ---
class WbsCategoryBase(BaseModel):
    program_id: int
    category_name: str

class WbsCategoryCreate(WbsCategoryBase):
    pass

class WbsCategory(WbsCategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- WBS Subcategory Schemas ---
class WbsSubcategoryBase(BaseModel):
    category_id: int
    subcategory_name: str

class WbsSubcategoryCreate(WbsSubcategoryBase):
    pass

class WbsSubcategory(WbsSubcategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Edit History Schemas ---
class EditHistoryBase(BaseModel):
    edited_by: str
    field_changed: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    record_id: int
    table_name: str

class EditHistory(EditHistoryBase):
    id: int
    edited_at: datetime

    model_config = ConfigDict(from_attributes=True)

# schemas.py (add these at the bottom or after your create schemas)

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict

# --- Program Update Schema ---
class ProgramUpdate(BaseModel):
    program_name: Optional[str] = None
    program_code: Optional[str] = None
    program_description: Optional[str] = None
    program_status: Optional[str] = None
    program_manager: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Ledger Transaction Update Schema ---
class LedgerTransactionUpdate(BaseModel):
    vendor_name: Optional[str] = None
    expense_description: Optional[str] = None
    wbs_category_id: Optional[int] = None
    wbs_subcategory_id: Optional[int] = None
    baseline_date: Optional[date] = None  # Changed from str to date
    baseline_amount: Optional[str] = None  # You may consider converting this to Decimal as well
    planned_date: Optional[date] = None    # Changed from str to date
    planned_amount: Optional[str] = None
    actual_date: Optional[date] = None     # Changed from str to date
    actual_amount: Optional[str] = None
    invoice_link: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- WBS Category Update Schema ---
class WbsCategoryUpdate(BaseModel):
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- WBS Subcategory Update Schema ---
class WbsSubcategoryUpdate(BaseModel):
    subcategory_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# schemas.py (append at the bottom)
from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Tuple
from datetime import date

class MonthlyCashFlowEntry(BaseModel):
    baseline: float
    planned: float
    actual: float

class VarianceAlert(BaseModel):
    wbs_category_id: int
    planned: float
    actual: float
    variance: float

# ✅ New schema for top vendors
class TopVendor(BaseModel):
    vendor: str
    spend: float
    
# ✅ Dashboard Summary Schema
class DashboardSummary(BaseModel):
    program_id: int
    as_of_date: str
    actuals_to_date: float
    planned_to_date: float
    etc: float
    eac: float
    monthly_cash_flow: Dict[str, MonthlyCashFlowEntry]
    variance_alerts: List[VarianceAlert]
    top_vendors: List[TopVendor]  # ✅ Expecting a list of dictionaries, not tuples

    model_config = ConfigDict(from_attributes=True)  # ✅ Ensures Pydantic V2 compatibility