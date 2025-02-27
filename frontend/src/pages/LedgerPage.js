/**
 * LedgerPage.js
 *
 * A parent/container component responsible for:
 *  - Fetching ledger data from the backend (transactions, WBS categories, etc.)
 *  - Providing the data and CRUD callbacks (add, update, delete) to the children components:
 *      - <LedgerForm /> : for adding new transactions
 *      - <LedgerGrid /> : for displaying/editing existing transactions via React Data Grid
 *
 * NOTE:
 *   This assumes you have:
 *     - LedgerForm.js (the collapsible new-transaction form)
 *     - LedgerGrid.js (React Data Grid for spreadsheet-like inline editing)
 *
 * Example file structure:
 *   src/
 *   ├─ pages/
 *   │   └─ LedgerPage.js
 *   └─ components/
 *       └─ ledger/
 *           ├─ LedgerForm.js
 *           └─ LedgerGrid.js
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import our new child components
import LedgerForm from '../components/ledger/LedgerForm';
import LedgerGrid from '../components/ledger/LedgerGrid';

function LedgerPage() {
  // Pull the program ID from the URL (e.g., /ledger/:programId)
  const { programId } = useParams();
  const navigate = useNavigate();

  // State to store program details (optional, for page title)
  const [program, setProgram] = useState(null);

  // State arrays for data fetched from the backend
  const [transactions, setTransactions] = useState([]);
  const [wbsCategories, setWbsCategories] = useState([]);
  const [wbsSubcategories, setWbsSubcategories] = useState([]);

  // Collapsible form
  const [formOpen, setFormOpen] = useState(true);

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

  // ------------------------------------------------------
  // 1. useEffect: Fetch all relevant data on mount or when programId changes
  // ------------------------------------------------------
  useEffect(() => {
    fetchProgram();
    fetchTransactions();
    fetchWbsCategories();
    fetchWbsSubcategories();
  }, [programId]);

  /**
   * Fetch the program details for display in the page title.
   */
  const fetchProgram = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/programs/${programId}`);
      setProgram(res.data);
    } catch (err) {
      console.error('Error fetching program:', err);
    }
  };

  /**
   * Fetch all ledger transactions from the backend, then filter them by this program's ID.
   * Store them in state.
   */
  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/ledger_transactions/');
      const allTx = response.data || [];
      const filtered = allTx.filter((tx) => tx.program_id === parseInt(programId));
      setTransactions(filtered);
    } catch (error) {
      console.error('Error fetching ledger transactions:', error);
    }
  };

  /**
   * Fetch WBS categories for the current program.
   */
  const fetchWbsCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/wbs_categories/');
      const catData = response.data || [];
      // Filter by program ID if needed
      const filteredCats = catData.filter(
        (cat) => cat.program_id === parseInt(programId)
      );
      setWbsCategories(filteredCats);
    } catch (error) {
      console.error('Error fetching WBS categories:', error);
    }
  };

  /**
   * Fetch all WBS subcategories (these might not be program-specific).
   */
  const fetchWbsSubcategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/wbs_subcategories/');
      setWbsSubcategories(response.data || []);
    } catch (error) {
      console.error('Error fetching WBS subcategories:', error);
    }
  };

  // ------------------------------------------------------
  // 2. CRUD callbacks for the LedgerGrid and LedgerForm
  // ------------------------------------------------------

  /**
   * Called by the LedgerGrid component when a cell edit is committed.
   * We do the PUT request here, then re-fetch the transaction list to reflect changes.
   */
  const updateTransaction = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:8000/ledger_transactions/${id}`, updatedData);
      fetchTransactions(); // Refresh list
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  /**
   * Called by the LedgerGrid component to delete a transaction.
   */
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/ledger_transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // ------------------------------------------------------
  // 3. Optional Search Filtering
  // ------------------------------------------------------
  const displayedTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.vendor_name.toLowerCase().includes(query) ||
      tx.expense_description.toLowerCase().includes(query) ||
      (tx.invoice_number && tx.invoice_number.toLowerCase().includes(query))
    );
  });

  // ------------------------------------------------------
  // 4. Render
  // ------------------------------------------------------
  return (
    // <div style={{ maxWidth: '90%', margin: '0 auto', padding: '1rem' }}>
    //debugging code
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '1rem' }}>
      {/* A back button to return to the program dashboard */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(`/dashboard/${programId}`)}>
          Back to Program Dashboard
        </button>
      </div>

      <h1>
        Ledger Transactions for{' '}
        {program ? program.program_name : `Program ${programId}`}
      </h1>

      {/* Search bar (optional) */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by Vendor, Description, or Invoice #"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px', marginRight: '0.5rem' }}
        />
      </div>

      {/* Collapsible form for adding new transactions.
          Note that LedgerForm calls fetchTransactions() after successfully adding a new transaction.
       */}
      <LedgerForm
        programId={programId}
        wbsCategories={wbsCategories}
        wbsSubcategories={wbsSubcategories}
        fetchTransactions={fetchTransactions}
      />

      <h2>Transactions List</h2>
      {/* Use the LedgerGrid (React Data Grid) to display/edit transactions */}
      <LedgerGrid
        transactions={displayedTransactions}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
        wbsCategories={wbsCategories}
        wbsSubcategories={wbsSubcategories}
      />
    </div>
  );
}

export default LedgerPage;
