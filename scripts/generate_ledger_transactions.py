#!/usr/bin/env python3

import requests
import random
import datetime

API_URL = "http://localhost:8000/ledger_transactions/"

def random_date(start_year=2023, end_year=2025):
    """Generate a random ISO-format date string between start_year and end_year."""
    start = datetime.date(start_year, 1, 1).toordinal()
    end = datetime.date(end_year, 12, 31).toordinal()
    random_day = random.randint(start, end)
    return datetime.date.fromordinal(random_day).isoformat()

def main():
    # Number of ledger transactions to create
    num_records = 200

    # We'll fix the program_id to 2, as requested
    program_id = 2

    # Potential data to randomize
    possible_vendors = ["Acme Corp", "GlobalTech", "OfficeSuppliesRUs", "WidgetCo", "AlphaDynamics"]
    possible_descriptions = ["Software License", "Hardware Upgrade", "Consulting Fee", "Laptop Purchase", "Cloud Subscription"]
    possible_links = ["http://example.com/invoice.pdf", "http://invoices.com/12345", ""]
    possible_notes = ["Urgent payment", "Pending approval", "Recurring expense", "", "Check with vendor"]

    # WBS categories are 4, 5, or 6
    wbs_categories = [4, 5, 6]
    # Subcategories if category=4 => 5..11
    #               if category=5 => 12
    #               if category=6 => 13

    for i in range(num_records):
        vendor_name = random.choice(possible_vendors)
        expense_description = random.choice(possible_descriptions)

        baseline_amount = round(random.uniform(50, 2000), 2)
        planned_amount = round(random.uniform(50, 3000), 2)
        actual_amount = round(random.uniform(50, 2500), 2)

        baseline_date = random_date()
        planned_date = random_date()
        actual_date = random_date()

        wbs_category_id = random.choice(wbs_categories)
        if wbs_category_id == 4:
            # subcategories for 4 are [5..11]
            wbs_subcategory_id = random.randint(5, 11)  # inclusive
        elif wbs_category_id == 5:
            wbs_subcategory_id = 12
        else:  # wbs_category_id == 6
            wbs_subcategory_id = 13

        invoice_link = random.choice(possible_links)
        invoice_number = f"INV-{random.randint(1000,9999)}"
        notes = random.choice(possible_notes)

        # Build the transaction body
        transaction_data = {
            "program_id": program_id,
            "vendor_name": vendor_name,
            "expense_description": expense_description,
            "baseline_amount": baseline_amount,
            "planned_amount": planned_amount,
            "actual_amount": actual_amount,
            "baseline_date": baseline_date,
            "planned_date": planned_date,
            "actual_date": actual_date,
            "wbs_category_id": wbs_category_id,
            "wbs_subcategory_id": wbs_subcategory_id,
            "invoice_link": invoice_link,
            "invoice_number": invoice_number,
            "notes": notes
        }

        try:
            response = requests.post(API_URL, json=transaction_data)
            response.raise_for_status()
            # If your API returns the created record ID
            record_id = response.json().get("id", "Unknown")
            print(f"Created record {i+1}/{num_records} - ID: {record_id}")
        except requests.exceptions.RequestException as e:
            print(f"Error creating record {i+1}: {e}")

if __name__ == "__main__":
    main()
