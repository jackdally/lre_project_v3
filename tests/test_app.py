# test_app.py
import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import models

client = TestClient(app)

# Use a module-scoped fixture to create (and later drop) the tables for testing.
@pytest.fixture(scope="module", autouse=True)
def create_test_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests are done
    Base.metadata.drop_all(bind=engine)

# Global variables to hold IDs between tests.
program_id = None
category_id = None
subcategory_id = None
ledger_transaction_id = None

# ---------------------------
# Test Programs Endpoints
# ---------------------------
def test_create_program():
    global program_id
    response = client.post("/programs/", json={
        "program_name": "Test Program",
        "program_code": "TP001",
        "program_description": "A test program",
        "program_status": "Active",
        "program_manager": "Test Manager"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["program_name"] == "Test Program"
    program_id = data["id"]

def test_get_programs():
    response = client.get("/programs/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # There should be at least one program.
    assert len(data) > 0

# ---------------------------
# Test WBS Categories Endpoints
# ---------------------------
def test_create_wbs_category():
    global category_id
    # Requires a valid program_id
    response = client.post("/wbs_categories/", json={
        "program_id": program_id,
        "category_name": "Test Category"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category_name"] == "Test Category"
    category_id = data["id"]

def test_get_wbs_categories():
    response = client.get("/wbs_categories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# ---------------------------
# Test WBS Subcategories Endpoints
# ---------------------------
def test_create_wbs_subcategory():
    global subcategory_id
    # Requires a valid category_id
    response = client.post("/wbs_subcategories/", json={
        "category_id": category_id,
        "subcategory_name": "Test Subcategory"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["subcategory_name"] == "Test Subcategory"
    subcategory_id = data["id"]

def test_get_wbs_subcategories():
    response = client.get("/wbs_subcategories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# ---------------------------
# Test Ledger Transactions Endpoints
# ---------------------------
def test_create_ledger_transaction():
    global ledger_transaction_id
    # Create a ledger transaction using valid program, category, and subcategory IDs.
    response = client.post("/ledger_transactions/", json={
        "program_id": program_id,
        "vendor_name": "Test Vendor",
        "expense_description": "Test expense",
        "wbs_category_id": category_id,
        "wbs_subcategory_id": subcategory_id,
        "baseline_date": "2023-01-01",
        "baseline_amount": "100.00",
        "planned_date": "2023-01-15",
        "planned_amount": "120.00",
        "actual_date": "2023-01-10",
        "actual_amount": "110.00",
        "invoice_link": "http://example.com/invoice",
        "invoice_number": "INV001",
        "notes": "Test note"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["vendor_name"] == "Test Vendor"
    ledger_transaction_id = data["id"]

def test_get_ledger_transactions():
    response = client.get("/ledger_transactions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

# ---------------------------
# Test Edit History Endpoint
# ---------------------------
def test_edit_history():
    # To trigger an edit history record, update an existing program record.
    # We'll update the program name directly using a database session.
    from sqlalchemy.orm import Session
    db: Session = SessionLocal()
    program = db.query(models.program.Program).filter(models.program.Program.id == program_id).first()
    old_name = program.program_name
    program.program_name = "Updated Program Name"
    db.commit()
    db.close()
    
    # Now, check the edit history endpoint for a record of the update.
    response = client.get("/edit_history/")
    assert response.status_code == 200
    data = response.json()
    # Look for an edit history record with the appropriate field change.
    found = any(
        record["field_changed"] == "program_name" and 
        record["old_value"] == old_name and 
        record["new_value"] == "Updated Program Name"
        for record in data
    )
    assert found
