# tests/test_endpoints.py
import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal

# Create a TestClient for our FastAPI app
client = TestClient(app)

# Use a module-scoped fixture to create (and later drop) the database tables.
@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Global dictionary to store created IDs across tests
global_ids = {
    "program_id": None,
    "wbs_category_id": None,
    "wbs_subcategory_id": None,
    "ledger_transaction_id": None,
}

# --- Programs Endpoints Tests ---
def test_create_program():
    response = client.post("/programs/", json={
        "program_name": "Test Program",
        "program_code": "TP001",
        "program_description": "Test program description",
        "program_status": "Active",
        "program_manager": "Manager A"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["program_name"] == "Test Program"
    global_ids["program_id"] = data["id"]

def test_get_programs():
    response = client.get("/programs/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(prog["id"] == global_ids["program_id"] for prog in data)

def test_update_program():
    program_id = global_ids["program_id"]
    response = client.put(f"/programs/{program_id}", json={
        "program_name": "Updated Program Name"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["program_name"] == "Updated Program Name"

# --- WBS Categories Endpoints Tests ---
def test_create_wbs_category():
    program_id = global_ids["program_id"]
    response = client.post("/wbs_categories/", json={
        "program_id": program_id,
        "category_name": "Test Category"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category_name"] == "Test Category"
    global_ids["wbs_category_id"] = data["id"]

def test_get_wbs_categories():
    response = client.get("/wbs_categories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(cat["id"] == global_ids["wbs_category_id"] for cat in data)

def test_update_wbs_category():
    category_id = global_ids["wbs_category_id"]
    response = client.put(f"/wbs_categories/{category_id}", json={
        "category_name": "Updated Category Name"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category_name"] == "Updated Category Name"

# --- WBS Subcategories Endpoints Tests ---
def test_create_wbs_subcategory():
    category_id = global_ids["wbs_category_id"]
    response = client.post("/wbs_subcategories/", json={
        "category_id": category_id,
        "subcategory_name": "Test Subcategory"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["subcategory_name"] == "Test Subcategory"
    global_ids["wbs_subcategory_id"] = data["id"]

def test_get_wbs_subcategories():
    response = client.get("/wbs_subcategories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(sub["id"] == global_ids["wbs_subcategory_id"] for sub in data)

def test_update_wbs_subcategory():
    subcategory_id = global_ids["wbs_subcategory_id"]
    response = client.put(f"/wbs_subcategories/{subcategory_id}", json={
        "subcategory_name": "Updated Subcategory Name"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["subcategory_name"] == "Updated Subcategory Name"

# --- Ledger Transactions Endpoints Tests ---
def test_create_ledger_transaction():
    program_id = global_ids["program_id"]
    wbs_category_id = global_ids["wbs_category_id"]
    wbs_subcategory_id = global_ids["wbs_subcategory_id"]
    response = client.post("/ledger_transactions/", json={
        "program_id": program_id,
        "vendor_name": "Test Vendor",
        "expense_description": "Test expense description",
        "wbs_category_id": wbs_category_id,
        "wbs_subcategory_id": wbs_subcategory_id,
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
    global_ids["ledger_transaction_id"] = data["id"]

def test_get_ledger_transactions():
    response = client.get("/ledger_transactions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(tx["id"] == global_ids["ledger_transaction_id"] for tx in data)

def test_update_ledger_transaction():
    transaction_id = global_ids["ledger_transaction_id"]
    response = client.put(f"/ledger_transactions/{transaction_id}", json={
        "vendor_name": "Updated Vendor"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["vendor_name"] == "Updated Vendor"

# --- Edit History Endpoint Test ---
def test_edit_history():
    # Update the program's manager to trigger an edit history entry.
    program_id = global_ids["program_id"]
    response = client.put(f"/programs/{program_id}", json={
        "program_manager": "Updated Manager"
    })
    assert response.status_code == 200

    # Now, check the edit history endpoint for the update.
    response = client.get("/edit_history/")
    assert response.status_code == 200
    data = response.json()
    found = any(
        record["field_changed"] == "program_manager" and record["new_value"] == "Updated Manager"
        for record in data
    )
    assert found

# --- Delete Endpoints Tests ---
def test_delete_ledger_transaction():
    transaction_id = global_ids["ledger_transaction_id"]
    response = client.delete(f"/ledger_transactions/{transaction_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "Ledger Transaction deleted"

def test_delete_wbs_subcategory():
    subcategory_id = global_ids["wbs_subcategory_id"]
    response = client.delete(f"/wbs_subcategories/{subcategory_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "WBS Subcategory deleted"

def test_delete_wbs_category():
    category_id = global_ids["wbs_category_id"]
    response = client.delete(f"/wbs_categories/{category_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "WBS Category deleted"

def test_delete_program():
    program_id = global_ids["program_id"]
    response = client.delete(f"/programs/{program_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "Program deleted"
