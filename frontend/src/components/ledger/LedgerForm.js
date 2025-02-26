/**
 * LedgerForm.js
 *
 * A collapsible form that lets users add new transactions to a given program.
 * This code is adapted from the "New Transaction" portion of LedgerPage.js.
 * 
 * Props:
 * - programId (number|string): ID of the current program (required).
 * - wbsCategories (array): List of WBS Category objects (each with {id, category_name, program_id}).
 * - wbsSubcategories (array): List of WBS Subcategory objects (each with {id, subcategory_name, category_id}).
 * - fetchTransactions (function): Callback to refresh the ledger transactions in the parent component.
 *
 * Example Usage:
 *   <LedgerForm
 *     programId={programId}
 *     wbsCategories={wbsCategories}
 *     wbsSubcategories={wbsSubcategories}
 *     fetchTransactions={fetchTransactions}
 *   />
 */

import React, { useState } from 'react';
import axios from 'axios';

function LedgerForm({ programId, wbsCategories, wbsSubcategories, fetchTransactions }) {
  // Collapsible form state
  const [formOpen, setFormOpen] = useState(false);

  // Local state for the new transaction fields
  const [newTransaction, setNewTransaction] = useState({
    vendor_name: '',
    expense_description: '',
    wbs_category_id: '',
    wbs_subcategory_id: '',
    notes: '',
    baseline_date: '',
    baseline_amount: '',
    planned_date: '',
    planned_amount: '',
    actual_date: '',
    actual_amount: '',
    invoice_number: '',
    invoice_link: ''
  });

  /**
   * Handle any text input changes by updating local state.
   * We spread the existing "newTransaction" object and override only the changed field.
   */
  const handleInputChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Special handler for WBS category selection.
   * We reset the subcategory whenever the category changes.
   */
  const handleCategoryChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      wbs_category_id: e.target.value,
      wbs_subcategory_id: '' // clear subcategory
    });
  };

  /**
   * Subcategory options are filtered based on the currently selected category.
   */
  const filteredSubcategories = newTransaction.wbs_category_id
    ? wbsSubcategories.filter(
        (sub) => sub.category_id === parseInt(newTransaction.wbs_category_id)
      )
    : [];

  /**
   * Form submission handler:
   * - Prevent default form submission.
   * - Build a transactionData object that includes the program ID.
   * - Convert empty strings to null for date/amount fields.
   * - POST to the /ledger_transactions/ endpoint.
   * - Refresh the transactions in the parent by calling fetchTransactions().
   * - Reset the form fields (optionally keep the form open).
   */
  const handleAddTransaction = (e) => {
    e.preventDefault();

    // Prepare transaction data
    const transactionData = {
      ...newTransaction,
      program_id: parseInt(programId)
    };

    // Convert empty strings to null for relevant fields
    for (let field of [
      'wbs_category_id',
      'wbs_subcategory_id',
      'baseline_date',
      'planned_date',
      'actual_date'
    ]) {
      if (!transactionData[field]) transactionData[field] = null;
    }
    for (let amtField of ['baseline_amount', 'planned_amount', 'actual_amount']) {
      if (transactionData[amtField] === '') transactionData[amtField] = null;
    }

    // POST new transaction to server
    axios
      .post('http://localhost:8000/ledger_transactions/', transactionData)
      .then(() => {
        // Refresh the ledger table in the parent
        fetchTransactions();

        // Reset form fields (we'll keep the form open for convenience)
        setNewTransaction({
          vendor_name: '',
          expense_description: '',
          wbs_category_id: '',
          wbs_subcategory_id: '',
          notes: '',
          baseline_date: '',
          baseline_amount: '',
          planned_date: '',
          planned_amount: '',
          actual_date: '',
          actual_amount: '',
          invoice_number: '',
          invoice_link: ''
        });
      })
      .catch((error) => {
        console.error('Error adding transaction:', error);
      });
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '6px',
        marginBottom: '2rem'
      }}
    >
      {/* Collapsible header */}
      <div
        onClick={() => setFormOpen(!formOpen)}
        style={{
          backgroundColor: '#f2f2f2',
          padding: '0.75rem',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {formOpen ? 'Hide' : 'Show'} Add Transaction
      </div>

      {/* Form Body (only visible if formOpen is true) */}
      {formOpen && (
        <div style={{ padding: '0.75rem' }}>
          <form onSubmit={handleAddTransaction} style={{ display: 'grid', rowGap: '0.75rem' }}>
            {/* Row 1: Vendor Name & Expense Description */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Vendor Name
                  <input
                    type="text"
                    name="vendor_name"
                    value={newTransaction.vendor_name}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Expense Description
                  <input
                    type="text"
                    name="expense_description"
                    value={newTransaction.expense_description}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </label>
              </div>
            </div>

            {/* Row 2: WBS Category & Subcategory */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  WBS Category
                  <select
                    name="wbs_category_id"
                    value={newTransaction.wbs_category_id}
                    onChange={handleCategoryChange}
                    style={inputStyle}
                  >
                    <option value="">Select WBS Category</option>
                    {wbsCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  WBS Subcategory
                  <select
                    name="wbs_subcategory_id"
                    value={newTransaction.wbs_subcategory_id}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">Select WBS Subcategory</option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subcategory_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Row 3: Notes */}
            <div>
              <label style={labelStyle}>
                Notes
                <input
                  type="text"
                  name="notes"
                  value={newTransaction.notes}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </label>
            </div>

            {/* Row 4: Baseline, Planned, Actual fields grouped */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Baseline */}
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  flex: '1 1 160px'
                }}
              >
                <label style={labelStyle}>
                  Baseline Date
                  <input
                    type="date"
                    name="baseline_date"
                    value={newTransaction.baseline_date || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Baseline Amount
                  <input
                    type="number"
                    name="baseline_amount"
                    value={newTransaction.baseline_amount || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Planned */}
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  flex: '1 1 160px'
                }}
              >
                <label style={labelStyle}>
                  Planned Date
                  <input
                    type="date"
                    name="planned_date"
                    value={newTransaction.planned_date || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Planned Amount
                  <input
                    type="number"
                    name="planned_amount"
                    value={newTransaction.planned_amount || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
              </div>

              {/* Actual */}
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  flex: '1 1 160px'
                }}
              >
                <label style={labelStyle}>
                  Actual Date
                  <input
                    type="date"
                    name="actual_date"
                    value={newTransaction.actual_date || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Actual Amount
                  <input
                    type="number"
                    name="actual_amount"
                    value={newTransaction.actual_amount || ''}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
              </div>
            </div>

            {/* Row 5: Invoice Number & Link */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Invoice Number
                  <input
                    type="text"
                    name="invoice_number"
                    value={newTransaction.invoice_number}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Invoice Link
                  <input
                    type="text"
                    name="invoice_link"
                    value={newTransaction.invoice_link}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" style={{ marginTop: '0.5rem' }}>
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Reuse basic inline styles from your original code
const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontWeight: 500,
  marginBottom: '0.25rem'
};

const inputStyle = {
  marginTop: '0.25rem',
  padding: '0.25rem'
};

export default LedgerForm;
