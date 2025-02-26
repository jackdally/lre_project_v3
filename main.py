# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal, engine
import models
from models.program import Program as ProgramModel
from models.ledger_transaction import LedgerTransaction as LedgerTransactionModel
from models.wbs_category import WbsCategory as WbsCategoryModel
from models.wbs_subcategory import WbsSubcategory as WbsSubcategoryModel
from models.edit_history import EditHistory as EditHistoryModel
import schemas
import history_listener  # Ensure the event listener is registered
from fastapi.middleware.cors import CORSMiddleware

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LRE Project API")

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow only your frontend origin
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------
# Programs Endpoints
# ---------------------------
@app.post("/programs/", response_model=schemas.Program)
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    db_program = ProgramModel(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

@app.get("/programs/", response_model=List[schemas.Program])
def read_programs(skip: int = 0, limit: int = None, db: Session = Depends(get_db)):
    programs = db.query(ProgramModel).offset(skip).limit(limit).all()
    return programs

@app.get("/programs/{program_id}", response_model=schemas.Program)
def read_program(program_id: int, db: Session = Depends(get_db)):
    db_program = db.query(ProgramModel).filter(ProgramModel.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    return db_program


@app.put("/programs/{program_id}", response_model=schemas.Program)
def update_program(program_id: int, program_update: schemas.ProgramUpdate, db: Session = Depends(get_db)):
    db_program = db.query(ProgramModel).filter(ProgramModel.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    update_data = program_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_program, key, value)
    db.commit()
    db.refresh(db_program)
    return db_program

@app.delete("/programs/{program_id}", response_model=dict)
def delete_program(program_id: int, db: Session = Depends(get_db)):
    db_program = db.query(ProgramModel).filter(ProgramModel.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    db.delete(db_program)
    db.commit()
    return {"detail": "Program deleted"}

# ---------------------------
# Ledger Transactions Endpoints
# ---------------------------
@app.post("/ledger_transactions/", response_model=schemas.LedgerTransaction)
def create_ledger_transaction(transaction: schemas.LedgerTransactionCreate, db: Session = Depends(get_db)):
    db_transaction = LedgerTransactionModel(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/ledger_transactions/", response_model=List[schemas.LedgerTransaction])
def read_ledger_transactions(skip: int = 0, limit: int = None, db: Session = Depends(get_db)):
    transactions = db.query(LedgerTransactionModel).offset(skip).limit(limit).all()
    return transactions

@app.put("/ledger_transactions/{transaction_id}", response_model=schemas.LedgerTransaction)
def update_ledger_transaction(transaction_id: int, update_data: schemas.LedgerTransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = db.query(LedgerTransactionModel).filter(LedgerTransactionModel.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Ledger Transaction not found")
    update_fields = update_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(db_transaction, key, value)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/ledger_transactions/{transaction_id}", response_model=dict)
def delete_ledger_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(LedgerTransactionModel).filter(LedgerTransactionModel.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Ledger Transaction not found")
    db.delete(db_transaction)
    db.commit()
    return {"detail": "Ledger Transaction deleted"}

# ---------------------------
# WBS Categories Endpoints
# ---------------------------
@app.post("/wbs_categories/", response_model=schemas.WbsCategory)
def create_wbs_category(category: schemas.WbsCategoryCreate, db: Session = Depends(get_db)):
    db_category = WbsCategoryModel(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/wbs_categories/", response_model=List[schemas.WbsCategory])
def read_wbs_categories(skip: int = 0, limit: int = None, db: Session = Depends(get_db)):
    categories = db.query(WbsCategoryModel).offset(skip).limit(limit).all()
    return categories

@app.put("/wbs_categories/{category_id}", response_model=schemas.WbsCategory)
def update_wbs_category(category_id: int, update_data: schemas.WbsCategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(WbsCategoryModel).filter(WbsCategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="WBS Category not found")
    update_fields = update_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/wbs_categories/{category_id}", response_model=dict)
def delete_wbs_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(WbsCategoryModel).filter(WbsCategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="WBS Category not found")
    db.delete(db_category)
    db.commit()
    return {"detail": "WBS Category deleted"}

# ---------------------------
# WBS Subcategories Endpoints
# ---------------------------
@app.post("/wbs_subcategories/", response_model=schemas.WbsSubcategory)
def create_wbs_subcategory(subcategory: schemas.WbsSubcategoryCreate, db: Session = Depends(get_db)):
    db_subcategory = WbsSubcategoryModel(**subcategory.model_dump())
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

@app.get("/wbs_subcategories/", response_model=List[schemas.WbsSubcategory])
def read_wbs_subcategories(skip: int = 0, limit: int = None, db: Session = Depends(get_db)):
    subcategories = db.query(WbsSubcategoryModel).offset(skip).limit(limit).all()
    return subcategories

@app.put("/wbs_subcategories/{subcategory_id}", response_model=schemas.WbsSubcategory)
def update_wbs_subcategory(subcategory_id: int, update_data: schemas.WbsSubcategoryUpdate, db: Session = Depends(get_db)):
    db_subcategory = db.query(WbsSubcategoryModel).filter(WbsSubcategoryModel.id == subcategory_id).first()
    if not db_subcategory:
        raise HTTPException(status_code=404, detail="WBS Subcategory not found")
    update_fields = update_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(db_subcategory, key, value)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

@app.delete("/wbs_subcategories/{subcategory_id}", response_model=dict)
def delete_wbs_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    db_subcategory = db.query(WbsSubcategoryModel).filter(WbsSubcategoryModel.id == subcategory_id).first()
    if not db_subcategory:
        raise HTTPException(status_code=404, detail="WBS Subcategory not found")
    db.delete(db_subcategory)
    db.commit()
    return {"detail": "WBS Subcategory deleted"}

# ---------------------------
# Edit History Endpoint (GET only)
# ---------------------------
@app.get("/edit_history/", response_model=List[schemas.EditHistory])
def read_edit_history(skip: int = 0, limit: int = None, db: Session = Depends(get_db)):
    histories = db.query(models.edit_history.EditHistory).order_by(models.edit_history.EditHistory.edited_at.desc()).offset(skip).limit(limit).all()
    return histories

# ---------------------------
# Dashboard Endpoint
# ---------------------------

from fastapi import Query
from datetime import datetime
from collections import defaultdict
from models.ledger_transaction import LedgerTransaction as LedgerTransactionModel
import schemas

@app.get("/dashboard/summary/", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    program_id: int = Query(..., description="ID of the program"),
    as_of_date: str = Query(..., description="Date in YYYY-MM-DD format for financial summary"),
    db: Session = Depends(get_db)
):
    # Parse the provided date
    try:
        as_of = datetime.strptime(as_of_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Get all transactions for this program
    transactions = db.query(LedgerTransactionModel).filter(LedgerTransactionModel.program_id == program_id).all()

    # Metrics Calculation
    actuals_to_date = sum(float(t.actual_amount or 0) for t in transactions if t.actual_date and t.actual_date <= as_of)
    planned_to_date = sum(float(t.planned_amount or 0) for t in transactions if t.planned_date and t.planned_date <= as_of)
    planned_to_go = sum(float(t.planned_amount or 0) for t in transactions if t.planned_date and t.planned_date >= as_of)

    category_variance = {}
    vendor_spend = {}
    monthly_cash_flow = defaultdict(lambda: {"baseline": 0.0, "planned": 0.0, "actual": 0.0})

    for t in transactions:
        # # Accumulate actuals and planned spend
        # if t.actual_date and t.actual_date <= as_of:
        #     actuals_to_date += float(t.actual_amount or 0)

        # if t.planned_date and t.planned_date <= as_of:
        #     planned_to_date += float(t.planned_amount or 0)

        # Categorize transactions by WBS category
        if t.wbs_category_id:
            category_variance.setdefault(t.wbs_category_id, {"planned": 0.0, "actual": 0.0})
            category_variance[t.wbs_category_id]["planned"] += float(t.planned_amount or 0)
            category_variance[t.wbs_category_id]["actual"] += float(t.actual_amount or 0)

        # Track spending by vendor
        if t.vendor_name:
            vendor_spend.setdefault(t.vendor_name, 0.0)
            vendor_spend[t.vendor_name] += float(t.actual_amount or 0)

        # Monthly cash flow (YYYY-MM format)
        if t.baseline_date:
            month_key = t.baseline_date.strftime("%Y-%m")
            monthly_cash_flow[month_key]["baseline"] += float(t.baseline_amount or 0)

        if t.planned_date:
            month_key = t.planned_date.strftime("%Y-%m")
            monthly_cash_flow[month_key]["planned"] += float(t.planned_amount or 0)

        if t.actual_date:
            month_key = t.actual_date.strftime("%Y-%m")
            monthly_cash_flow[month_key]["actual"] += float(t.actual_amount or 0)

    # Calculate Estimate at Completion (EAC) and Variance
    etc = planned_to_go
    eac = actuals_to_date + etc

    # Identify Top Variance Categories
    variance_alerts = []
    for category_id, values in category_variance.items():
        variance = abs(values["planned"] - values["actual"])
        if variance > 1000:  # Threshold for alert (adjust as needed)
            variance_alerts.append({
                "wbs_category_id": category_id,
                "planned": values["planned"],
                "actual": values["actual"],
                "variance": variance
            })

    # Identify Top 5 Vendors by Spend
    top_vendors = [{"vendor": vendor, "spend": float(spend)} for vendor, spend in sorted(vendor_spend.items(), key=lambda x: x[1], reverse=True)[:5]]


    return {
        "program_id": program_id,
        "as_of_date": as_of_date,
        "actuals_to_date": actuals_to_date,
        "planned_to_date": planned_to_date,
        "etc": etc,
        "eac": eac,
        "monthly_cash_flow": monthly_cash_flow,
        "variance_alerts": variance_alerts,
        "top_vendors": top_vendors,
    }
