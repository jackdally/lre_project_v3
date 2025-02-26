// src/pages/LedgerPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LedgerPage() {
  const { programId } = useParams();
  const navigate = useNavigate();

  // State for all transactions
  const [transactions, setTransactions] = useState([]);
  // State for the new transaction form
  const [newTransaction, setNewTransaction] = useState({
    vendor_name: '',
    expense_description: '',
    wbs_category_id: '',
    wbs_subcategory_id: '',
    baseline_date: '',
    baseline_amount: '',
    planned_date: '',
    planned_amount: '',
    actual_date: '',
    actual_amount: '',
    invoice_link: '',
    invoice_number: '',
    notes: ''
  });
  // States for WBS options
  const [wbsCategories, setWbsCategories] = useState([]);
  const [wbsSubcategories, setWbsSubcategories] = useState([]);

  // States to manage inline editing for transactions
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editingTransactionData, setEditingTransactionData] = useState({});

  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch ledger transactions filtered by programId
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

  // Fetch WBS categories for this program
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

  // Fetch all WBS subcategories
  const fetchWbsSubcategories = () => {
    axios
      .get('http://localhost:8000/wbs_subcategories/')
      .then((response) => {
        setWbsSubcategories(response.data);
      })
      .catch((error) => console.error('Error fetching WBS subcategories:', error));
  };

  useEffect(() => {
    fetchTransactions();
    fetchWbsCategories();
    fetchWbsSubcategories();
  }, [programId]);

  // Handle changes for new transaction form (non-dropdown fields)
  const handleInputChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  // Handle change for WBS Category dropdown (for new transaction)
  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setNewTransaction({
      ...newTransaction,
      wbs_category_id: selectedCategoryId,
      wbs_subcategory_id: '' // reset subcategory when category changes
    });
  };

  // Filter subcategories based on selected WBS category for new transaction
  const filteredSubcategories = newTransaction.wbs_category_id
    ? wbsSubcategories.filter(
        (sub) => sub.category_id === parseInt(newTransaction.wbs_category_id)
      )
    : [];

  // Submit new transaction with conversion for empty string values
  const handleAddTransaction = (e) => {
    e.preventDefault();
    const transactionData = { ...newTransaction, program_id: parseInt(programId) };

    // Convert empty strings to null for optional fields (WBS, dates, amounts)
    if (transactionData.wbs_category_id === '') {
      transactionData.wbs_category_id = null;
    }
    if (transactionData.wbs_subcategory_id === '') {
      transactionData.wbs_subcategory_id = null;
    }
    if (transactionData.baseline_date === '') {
      transactionData.baseline_date = null;
    }
    if (transactionData.planned_date === '') {
      transactionData.planned_date = null;
    }
    if (transactionData.actual_date === '') {
      transactionData.actual_date = null;
    }
    if (transactionData.baseline_amount === '') {
      transactionData.baseline_amount = null;
    }
    if (transactionData.planned_amount === '') {
      transactionData.planned_amount = null;
    }
    if (transactionData.actual_amount === '') {
      transactionData.actual_amount = null;
    }

    axios
      .post('http://localhost:8000/ledger_transactions/', transactionData)
      .then(() => {
        fetchTransactions();
        // Reset form
        setNewTransaction({
          vendor_name: '',
          expense_description: '',
          wbs_category_id: '',
          wbs_subcategory_id: '',
          baseline_date: '',
          baseline_amount: '',
          planned_date: '',
          planned_amount: '',
          actual_date: '',
          actual_amount: '',
          invoice_link: '',
          invoice_number: '',
          notes: ''
        });
      })
      .catch((error) => console.error('Error adding transaction:', error));
  };

  // Start inline editing for a given transaction
  const handleEditClick = (tx) => {
    setEditingTransactionId(tx.id);
    // Clone the transaction data into our editing state
    setEditingTransactionData({ ...tx });
  };

  // Handle change in editing fields
  const handleEditChange = (e) => {
    setEditingTransactionData({
      ...editingTransactionData,
      [e.target.name]: e.target.value
    });
  };

  // Handle change for WBS Category dropdown in edit mode
  const handleEditCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setEditingTransactionData({
      ...editingTransactionData,
      wbs_category_id: selectedCategoryId,
      wbs_subcategory_id: '' // reset subcategory if category changes
    });
  };

  // Save updated transaction (PUT) with conversion for empty string values
  const handleUpdateTransaction = (id) => {
    const {
      vendor_name,
      expense_description,
      baseline_amount,
      planned_amount,
      actual_amount,
      baseline_date,
      planned_date,
      actual_date,
      wbs_category_id,
      wbs_subcategory_id,
      invoice_link,
      invoice_number,
      notes
    } = editingTransactionData;

    const updateData = {
      vendor_name,
      expense_description,
      baseline_amount: baseline_amount === '' ? null : baseline_amount,
      planned_amount: planned_amount === '' ? null : planned_amount,
      actual_amount: actual_amount === '' ? null : actual_amount,
      baseline_date: baseline_date === '' ? null : baseline_date,
      planned_date: planned_date === '' ? null : planned_date,
      actual_date: actual_date === '' ? null : actual_date,
      wbs_category_id: wbs_category_id === '' ? null : wbs_category_id,
      wbs_subcategory_id: wbs_subcategory_id === '' ? null : wbs_subcategory_id,
      invoice_link,
      invoice_number,
      notes
    };

    axios
      .put(`http://localhost:8000/ledger_transactions/${id}`, updateData)
      .then(() => {
        setEditingTransactionId(null);
        fetchTransactions();
      })
      .catch((error) => console.error('Error updating transaction:', error));
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingTransactionData({});
  };

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:8000/ledger_transactions/${id}`)
      .then(() => fetchTransactions())
      .catch((error) => console.error('Error deleting transaction:', error));
  };

  // Filter transactions based on search
  const displayedTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.vendor_name.toLowerCase().includes(query) ||
      tx.expense_description.toLowerCase().includes(query) ||
      (tx.invoice_number && tx.invoice_number.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Back Button: Takes user back to the Program Dashboard */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(`/dashboard/${programId}`)}>
          Back to Program Dashboard
        </button>
      </div>

      <h1>Ledger Transactions for Program {programId}</h1>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by Vendor, Description, or Invoice #"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px', marginRight: '0.5rem' }}
        />
      </div>

      {/* Form for adding new transaction */}
      <h2>Add New Transaction</h2>
      <form onSubmit={handleAddTransaction} style={{ marginBottom: '2rem' }}>
        <div>
          <input
            type="text"
            name="vendor_name"
            placeholder="Vendor Name"
            value={newTransaction.vendor_name}
            onChange={handleInputChange}
            required
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="text"
            name="expense_description"
            placeholder="Expense Description"
            value={newTransaction.expense_description}
            onChange={handleInputChange}
            required
            style={{ marginRight: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="number"
            name="baseline_amount"
            placeholder="Baseline Amount"
            value={newTransaction.baseline_amount}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="number"
            name="planned_amount"
            placeholder="Planned Amount"
            value={newTransaction.planned_amount}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="number"
            name="actual_amount"
            placeholder="Actual Amount"
            value={newTransaction.actual_amount}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="date"
            name="baseline_date"
            value={newTransaction.baseline_date}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="date"
            name="planned_date"
            value={newTransaction.planned_date}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="date"
            name="actual_date"
            value={newTransaction.actual_date}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          {/* Optional Dropdown for WBS Category */}
          <select
            name="wbs_category_id"
            value={newTransaction.wbs_category_id}
            onChange={handleCategoryChange}
            style={{ marginRight: '0.5rem' }}
          >
            <option value="">Select WBS Category</option>
            {wbsCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          {/* Optional Dropdown for WBS Subcategory */}
          <select
            name="wbs_subcategory_id"
            value={newTransaction.wbs_subcategory_id}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          >
            <option value="">Select WBS Subcategory</option>
            {newTransaction.wbs_category_id &&
              wbsSubcategories
                .filter((sub) =>
                  sub.category_id === parseInt(newTransaction.wbs_category_id)
                )
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subcategory_name}
                  </option>
                ))}
          </select>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            name="invoice_link"
            placeholder="Invoice Link"
            value={newTransaction.invoice_link}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="text"
            name="invoice_number"
            placeholder="Invoice Number"
            value={newTransaction.invoice_number}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            name="notes"
            placeholder="Notes"
            value={newTransaction.notes}
            onChange={handleInputChange}
            style={{ marginRight: '0.5rem', width: '300px' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Add Transaction
        </button>
      </form>

      {/* Transactions Table */}
      <h2>Transactions List</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vendor</th>
            <th>Description</th>
            <th>Baseline Amt</th>
            <th>Planned Amt</th>
            <th>Actual Amt</th>
            <th>Baseline Date</th>
            <th>Planned Date</th>
            <th>Actual Date</th>
            <th>WBS Cat ID</th>
            <th>WBS Subcat ID</th>
            <th>Invoice #</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedTransactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="text"
                    name="vendor_name"
                    value={editingTransactionData.vendor_name}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.vendor_name
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="text"
                    name="expense_description"
                    value={editingTransactionData.expense_description}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.expense_description
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="number"
                    name="baseline_amount"
                    value={editingTransactionData.baseline_amount}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.baseline_amount
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="number"
                    name="planned_amount"
                    value={editingTransactionData.planned_amount}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.planned_amount
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="number"
                    name="actual_amount"
                    value={editingTransactionData.actual_amount}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.actual_amount
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="date"
                    name="baseline_date"
                    value={editingTransactionData.baseline_date}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.baseline_date
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="date"
                    name="planned_date"
                    value={editingTransactionData.planned_date}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.planned_date
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="date"
                    name="actual_date"
                    value={editingTransactionData.actual_date}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.actual_date
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <select
                    name="wbs_category_id"
                    value={editingTransactionData.wbs_category_id}
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
                  tx.wbs_category_id
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <select
                    name="wbs_subcategory_id"
                    value={editingTransactionData.wbs_subcategory_id}
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
                  tx.wbs_subcategory_id
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="text"
                    name="invoice_number"
                    value={editingTransactionData.invoice_number}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.invoice_number
                )}
              </td>
              <td>
                {editingTransactionId === tx.id ? (
                  <input
                    type="text"
                    name="notes"
                    value={editingTransactionData.notes}
                    onChange={handleEditChange}
                  />
                ) : (
                  tx.notes
                )}
              </td>
              <td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LedgerPage;
