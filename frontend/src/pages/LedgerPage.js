// src/pages/LedgerPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LedgerPage() {
  const { programId } = useParams();
  const navigate = useNavigate();

  // Program data (for display in title)
  const [program, setProgram] = useState(null);

  // Ledger transactions
  const [transactions, setTransactions] = useState([]);

  // WBS categories/subcategories
  const [wbsCategories, setWbsCategories] = useState([]);
  const [wbsSubcategories, setWbsSubcategories] = useState([]);

  // Collapsible form
  const [formOpen, setFormOpen] = useState(false);

  // New transaction form (grouped fields)
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

  // Row-based editing
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editingTransactionData, setEditingTransactionData] = useState({});

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------
  // FETCH DATA
  // ---------------------------
  useEffect(() => {
    fetchProgram();
    fetchTransactions();
    fetchWbsCategories();
    fetchWbsSubcategories();
  }, [programId]);

  const fetchProgram = () => {
    axios
      .get(`http://localhost:8000/programs/${programId}`)
      .then((res) => setProgram(res.data))
      .catch((err) => console.error('Error fetching program:', err));
  };

  const fetchTransactions = () => {
    axios
      .get('http://localhost:8000/ledger_transactions/')
      .then((response) => {
        const filtered = response.data.filter(
          (tx) => tx.program_id === parseInt(programId)
        );
        setTransactions(filtered);
      })
      .catch((error) => console.error('Error fetching ledger transactions:', error));
  };

  const fetchWbsCategories = () => {
    axios
      .get('http://localhost:8000/wbs_categories/')
      .then((response) => {
        const filtered = response.data.filter(
          (cat) => cat.program_id === parseInt(programId)
        );
        setWbsCategories(filtered);
      })
      .catch((error) => console.error('Error fetching WBS categories:', error));
  };

  const fetchWbsSubcategories = () => {
    axios
      .get('http://localhost:8000/wbs_subcategories/')
      .then((response) => setWbsSubcategories(response.data))
      .catch((error) => console.error('Error fetching WBS subcategories:', error));
  };

  // ---------------------------
  // NEW TRANSACTION
  // ---------------------------
  const handleInputChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      wbs_category_id: e.target.value,
      wbs_subcategory_id: ''
    });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const transactionData = { ...newTransaction, program_id: parseInt(programId) };

    // Convert empty strings to null
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

    axios
      .post('http://localhost:8000/ledger_transactions/', transactionData)
      .then(() => {
        fetchTransactions();
        // Reset form (stay open)
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
      .catch((error) => console.error('Error adding transaction:', error));
  };

  // For subcategory filter
  const filteredSubcategories = newTransaction.wbs_category_id
    ? wbsSubcategories.filter(
        (sub) => sub.category_id === parseInt(newTransaction.wbs_category_id)
      )
    : [];

  // ---------------------------
  // ROW EDIT
  // ---------------------------
  const handleEditClick = (tx) => {
    setEditingTransactionId(tx.id);
    setEditingTransactionData({ ...tx });
  };

  const handleEditChange = (e) => {
    setEditingTransactionData({
      ...editingTransactionData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditCategoryChange = (e) => {
    setEditingTransactionData({
      ...editingTransactionData,
      wbs_category_id: e.target.value,
      wbs_subcategory_id: ''
    });
  };

  const handleUpdateTransaction = (id) => {
    const {
      vendor_name,
      expense_description,
      notes,
      baseline_date,
      baseline_amount,
      planned_date,
      planned_amount,
      actual_date,
      actual_amount,
      wbs_category_id,
      wbs_subcategory_id,
      invoice_number,
      invoice_link
    } = editingTransactionData;

    const updateData = {
      vendor_name,
      expense_description,
      notes,
      baseline_date: baseline_date === '' ? null : baseline_date,
      baseline_amount: baseline_amount === '' ? null : baseline_amount,
      planned_date: planned_date === '' ? null : planned_date,
      planned_amount: planned_amount === '' ? null : planned_amount,
      actual_date: actual_date === '' ? null : actual_date,
      actual_amount: actual_amount === '' ? null : actual_amount,
      wbs_category_id: wbs_category_id === '' ? null : wbs_category_id,
      wbs_subcategory_id: wbs_subcategory_id === '' ? null : wbs_subcategory_id,
      invoice_number,
      invoice_link
    };

    axios
      .put(`http://localhost:8000/ledger_transactions/${id}`, updateData)
      .then(() => {
        setEditingTransactionId(null);
        fetchTransactions();
      })
      .catch((error) => console.error('Error updating transaction:', error));
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingTransactionData({});
  };

  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:8000/ledger_transactions/${id}`)
      .then(() => fetchTransactions())
      .catch((error) => console.error('Error deleting transaction:', error));
  };

  // ---------------------------
  // HIGHLIGHTS & UTILS
  // ---------------------------
  // Light green if actual date/amount, light yellow if planned but no actual, gray if baseline only
  const getRowBackground = (tx) => {
    if (tx.actual_date && tx.actual_amount) return '#d4edda'; // green
    if (
      tx.planned_date &&
      tx.planned_amount &&
      (!tx.actual_date || !tx.actual_amount)
    )
      return '#fff3cd'; // yellow
    if (
      tx.baseline_date &&
      tx.baseline_amount &&
      !tx.planned_date &&
      !tx.planned_amount
    )
      return '#e2e3e5'; // gray
    return '#fff'; // default white
  };

  // Show USD with 0 decimals in read mode
  const formatUsd0 = (amount) => {
    if (!amount || isNaN(amount)) return '';
    const rounded = Math.round(parseFloat(amount));
    return `$${rounded.toLocaleString('en-US')}`;
  };

  // WBS name resolvers
  const getWbsCategoryName = (catId) => {
    if (!catId) return '';
    const cat = wbsCategories.find((c) => c.id === catId);
    return cat ? cat.category_name : '';
  };
  const getWbsSubcategoryName = (subId) => {
    if (!subId) return '';
    const sub = wbsSubcategories.find((s) => s.id === subId);
    return sub ? sub.subcategory_name : '';
  };

  // ---------------------------
  // SEARCH
  // ---------------------------
  const displayedTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.vendor_name.toLowerCase().includes(query) ||
      tx.expense_description.toLowerCase().includes(query) ||
      (tx.invoice_number && tx.invoice_number.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ maxWidth: '90%', margin: '0 auto', padding: '1rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(`/dashboard/${programId}`)}>
          Back to Program Dashboard
        </button>
      </div>

      <h1>
        Ledger Transactions for{' '}
        {program ? program.program_name : `Program ${programId}`}
      </h1>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by Vendor, Description, or Invoice #"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px', marginRight: '0.5rem' }}
        />
      </div>

      {/* Collapsible Form */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}
      >
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
        {formOpen && (
          <div style={{ padding: '0.75rem' }}>
            <form onSubmit={handleAddTransaction} style={{ display: 'grid', rowGap: '0.75rem' }}>
              {/* Group 1 */}
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

              {/* Group 2 - subgroups */}
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
                      value={newTransaction.baseline_date}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    Baseline Amount
                    <input
                      type="number"
                      name="baseline_amount"
                      value={newTransaction.baseline_amount}
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
                      value={newTransaction.planned_date}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    Planned Amount
                    <input
                      type="number"
                      name="planned_amount"
                      value={newTransaction.planned_amount}
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
                      value={newTransaction.actual_date}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    Actual Amount
                    <input
                      type="number"
                      name="actual_amount"
                      value={newTransaction.actual_amount}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </label>
                </div>
              </div>

              {/* Group 3 */}
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

              <div>
                <button type="submit" style={{ marginTop: '0.5rem' }}>
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <h2>Transactions List</h2>
      <table
        style={{
          border: '1px solid #ccc',
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '0.9rem'
        }}
      >
        <thead>
          <tr>
            {/* Order: Vendor, Desc, WBS Cat, WBS Subcat, Invoice #, 
                Baseline Date, Baseline Amt, 
                Planned Date, Planned Amt, 
                Actual Date, Actual Amt, 
                Notes, Actions */}
            <th style={thStyle}>Vendor</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>WBS Category</th>
            <th style={thStyle}>WBS Subcategory</th>
            <th style={thStyle}>Invoice #</th>
            <th style={thStyle}>Baseline Date</th>
            <th style={thStyle}>Baseline Amt</th>
            <th style={thStyle}>Planned Date</th>
            <th style={thStyle}>Planned Amt</th>
            <th style={thStyle}>Actual Date</th>
            <th style={thStyle}>Actual Amt</th>
            <th style={thStyle}>Notes</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedTransactions.map((tx) => {
            const rowBg = getRowBackground(tx);
            const catName = getWbsCategoryName(tx.wbs_category_id);
            const subcatName = getWbsSubcategoryName(tx.wbs_subcategory_id);

            return (
              <tr key={tx.id} style={{ backgroundColor: rowBg }}>
                {/* Vendor */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="text"
                      name="vendor_name"
                      value={editingTransactionData.vendor_name || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.vendor_name
                  )}
                </td>

                {/* Description */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="text"
                      name="expense_description"
                      value={editingTransactionData.expense_description || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.expense_description
                  )}
                </td>

                {/* WBS Category */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <select
                      name="wbs_category_id"
                      value={editingTransactionData.wbs_category_id || ''}
                      onChange={handleEditCategoryChange}
                    >
                      <option value="">Select WBS Category</option>
                      {wbsCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    catName
                  )}
                </td>

                {/* WBS Subcategory */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <select
                      name="wbs_subcategory_id"
                      value={editingTransactionData.wbs_subcategory_id || ''}
                      onChange={handleEditChange}
                    >
                      <option value="">Select WBS Subcategory</option>
                      {editingTransactionData.wbs_category_id &&
                        wbsSubcategories
                          .filter(
                            (sub) =>
                              sub.category_id ===
                              parseInt(editingTransactionData.wbs_category_id)
                          )
                          .map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.subcategory_name}
                            </option>
                          ))}
                    </select>
                  ) : (
                    subcatName
                  )}
                </td>

                {/* Invoice # link */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <>
                      <input
                        type="text"
                        name="invoice_number"
                        value={editingTransactionData.invoice_number || ''}
                        onChange={handleEditChange}
                      />
                      <input
                        type="text"
                        name="invoice_link"
                        value={editingTransactionData.invoice_link || ''}
                        onChange={handleEditChange}
                        placeholder="Invoice Link"
                        style={{ marginTop: '0.25rem' }}
                      />
                    </>
                  ) : tx.invoice_number ? (
                    <a
                      href={tx.invoice_link || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.invoice_number}
                    </a>
                  ) : (
                    ''
                  )}
                </td>

                {/* Baseline Date */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="date"
                      name="baseline_date"
                      value={editingTransactionData.baseline_date || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.baseline_date || ''
                  )}
                </td>

                {/* Baseline Amount (USD) */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="number"
                      name="baseline_amount"
                      value={editingTransactionData.baseline_amount || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    formatUsd0(tx.baseline_amount)
                  )}
                </td>

                {/* Planned Date */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="date"
                      name="planned_date"
                      value={editingTransactionData.planned_date || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.planned_date || ''
                  )}
                </td>

                {/* Planned Amount */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="number"
                      name="planned_amount"
                      value={editingTransactionData.planned_amount || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    formatUsd0(tx.planned_amount)
                  )}
                </td>

                {/* Actual Date */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="date"
                      name="actual_date"
                      value={editingTransactionData.actual_date || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.actual_date || ''
                  )}
                </td>

                {/* Actual Amount */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="number"
                      name="actual_amount"
                      value={editingTransactionData.actual_amount || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    formatUsd0(tx.actual_amount)
                  )}
                </td>

                {/* Notes */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <input
                      type="text"
                      name="notes"
                      value={editingTransactionData.notes || ''}
                      onChange={handleEditChange}
                    />
                  ) : (
                    tx.notes
                  )}
                </td>

                {/* Actions */}
                <td style={tdStyle}>
                  {editingTransactionId === tx.id ? (
                    <>
                      <button onClick={() => handleUpdateTransaction(tx.id)}>
                        Save
                      </button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(tx)}>Edit</button>
                      <button onClick={() => handleDeleteTransaction(tx.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Basic styles
const thStyle = {
  border: '1px solid #ccc',
  padding: '0.5rem',
  textAlign: 'left'
};
const tdStyle = {
  border: '1px solid #ccc',
  padding: '0.5rem',
  textAlign: 'left'
};
const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontWeight: '500',
  marginBottom: '0.25rem'
};
const inputStyle = {
  marginTop: '0.25rem',
  padding: '0.25rem'
};

export default LedgerPage;
