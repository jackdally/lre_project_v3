/**
 * LedgerGrid.js
 *
 * A React Data Grid component for displaying/editing ledger transactions
 * with single-click inline editing, a delete action, custom category/subcategory
 * dropdowns, and a hyperlinked Invoice # column.
 *
 * Installation:
 *   npm install react-data-grid
 *
 * Usage in LedgerPage.js (parent):
 *   <LedgerGrid
 *     transactions={transactions}
 *     onUpdateTransaction={updateTransaction}
 *     onDeleteTransaction={deleteTransaction}
 *     wbsCategories={wbsCategories}
 *     wbsSubcategories={wbsSubcategories}
 *   />
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Named imports from react-data-grid v7+
import { DataGrid, textEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

// ---------------------------------------------
// 1. WBS Category and Subcategory Editors
// ---------------------------------------------
function WbsCategoryEditor({ row, onRowChange, onClose, wbsCategories }) {
  /**
   * row: the current row data
   * onRowChange: function to call with the updated row
   * onClose: function to close the editor
   */
  const handleChange = (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    // Reset wbs_subcategory_id to null when category changes
    onRowChange(
      { ...row, wbs_category_id: categoryId, wbs_subcategory_id: null },
      true // commit immediately
    );
  };

  const handleBlur = () => onClose();

  return (
    <select
      style={{ width: '100%' }}
      autoFocus
      onBlur={handleBlur}
      value={row.wbs_category_id || ''}
      onChange={handleChange}
    >
      <option value="">Select WBS Category</option>
      {wbsCategories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.category_name}
        </option>
      ))}
    </select>
  );
}

function WbsSubcategoryEditor({ row, onRowChange, onClose, wbsSubcategories }) {
  // Filter subcategories based on the row's wbs_category_id
  const filteredSubs = useMemo(() => {
    if (!row.wbs_category_id) return [];
    return wbsSubcategories.filter((sub) => sub.category_id === row.wbs_category_id);
  }, [row.wbs_category_id, wbsSubcategories]);

  const handleChange = (e) => {
    const subcatId = e.target.value ? parseInt(e.target.value) : null;
    onRowChange({ ...row, wbs_subcategory_id: subcatId }, true);
  };

  const handleBlur = () => onClose();

  return (
    <select
      style={{ width: '100%' }}
      autoFocus
      onBlur={handleBlur}
      value={row.wbs_subcategory_id || ''}
      onChange={handleChange}
    >
      <option value="">Select WBS Subcategory</option>
      {filteredSubs.map((sub) => (
        <option key={sub.id} value={sub.id}>
          {sub.subcategory_name}
        </option>
      ))}
    </select>
  );
}

// ---------------------------------------------
// 2. Main LedgerGrid Component
// ---------------------------------------------
function LedgerGrid({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  wbsCategories = [],
  wbsSubcategories = []
}) {
  // Copy "transactions" into local state so we can handle inline edits
  const [rows, setRows] = useState([]);

  // Keep rows updated when the parent data changes
  useEffect(() => {
    setRows(transactions);
  }, [transactions]);

  /**
   * Convert empty strings to null in fields that should be null when empty.
   * This mimics your original approach for baseline/planned/actual fields, etc.
   */
  const normalizeRowData = (row) => {
    const updated = { ...row };
    for (let field of [
      'baseline_date',
      'planned_date',
      'actual_date',
      'wbs_category_id',
      'wbs_subcategory_id'
    ]) {
      if (updated[field] === '') updated[field] = null;
    }
    for (let amtField of ['baseline_amount', 'planned_amount', 'actual_amount']) {
      if (updated[amtField] === '') updated[amtField] = null;
    }
    return updated;
  };

  /**
   * Called by DataGrid after a cell edit is committed (user leaves cell).
   */
  const onRowsChange = useCallback(
    (updatedRows, { indexes }) => {
      setRows(updatedRows);

      // Typically only one row changes at a time
      const rowIndex = indexes[0];
      const updatedRow = updatedRows[rowIndex];
      if (updatedRow && updatedRow.id) {
        // Make sure we convert empty strings to null, etc.
        const finalRow = normalizeRowData(updatedRow);
        // Notify the parent so it can call PUT / update the backend
        onUpdateTransaction(finalRow.id, finalRow);
      }
    },
    [onUpdateTransaction]
  );

  /**
   * Row highlight: replicate your color scheme (green, yellow, gray) for certain conditions.
   */
  const rowClass = useCallback((row) => {
    if (row.actual_date && row.actual_amount) {
      return 'ledger-row-green'; // green
    }
    if (
      row.planned_date &&
      row.planned_amount &&
      (!row.actual_date || !row.actual_amount)
    ) {
      return 'ledger-row-yellow'; // yellow
    }
    if (
      row.baseline_date &&
      row.baseline_amount &&
      !row.planned_date &&
      !row.planned_amount
    ) {
      return 'ledger-row-gray'; // gray
    }
    return '';
  }, []);

  /**
   * 3. Column Definitions
   *
   * We set `formatter` to display read-only values (e.g., hyperlink for invoice_number),
   * and `editor` for inline editing. We rely on "textEditor" for simple string/number fields.
   */
  const columns = useMemo(() => {
    return [
      // Vendor
      {
        key: 'vendor_name',
        name: 'Vendor',
        width: 120
      },
      // Description
      {
        key: 'expense_description',
        name: 'Description',
        width: 160
      },
      // WBS Category: show category_name in read mode, custom dropdown in edit mode
      {
        key: 'wbs_category_id',
        name: 'WBS Category',
        width: 150,
        // Show the category name in read mode
        formatter: ({ row }) => {
          console.log("Row Data:", row); // Debugging line
          if (!row.wbs_category_id) return '';
          const cat = wbsCategories.find((c) => c.id === row.wbs_category_id);
          console.log("Found Category:", cat); // Debugging line
          return cat ? cat.category_name : '';
        },
        // Show a dropdown in edit mode
        editor: (props) => (
          <WbsCategoryEditor {...props} wbsCategories={wbsCategories} />
        )
      },
      // WBS Subcategory: show subcategory_name in read mode, dropdown in edit mode
      {
        key: 'wbs_subcategory_id',
        name: 'WBS Subcategory',
        width: 160,
        formatter: ({ row }) => {
          if (!row.wbs_subcategory_id) return '';
          const sub = wbsSubcategories.find((s) => s.id === row.wbs_subcategory_id);
          return sub ? sub.subcategory_name : '';
        },
        editor: (props) => (
          <WbsSubcategoryEditor {...props} wbsSubcategories={wbsSubcategories} />
        )
      },
      // Invoice #: Hyperlink using row.invoice_link, editable text for invoice_number
      {
        key: 'invoice_number',
        name: 'Invoice #',
        width: 100,
        formatter: ({ row }) => {
          const link = row.invoice_link;
          const number = row.invoice_number;
          if (!number) return '';
          return (
            <a href={link || '#'} target="_blank" rel="noreferrer">
              {number}
            </a>
          );
        },
        // We can still let the user edit the invoice_number text
        editor: textEditor
      },
      // baseline_date
      {
        key: 'baseline_date',
        name: 'Baseline Date',
        width: 120
      },
      // baseline_amount
      {
        key: 'baseline_amount',
        name: 'Baseline Amt',
        width: 120
      },
      // planned_date
      {
        key: 'planned_date',
        name: 'Planned Date',
        width: 120
      },
      // planned_amount
      {
        key: 'planned_amount',
        name: 'Planned Amt',
        width: 120
      },
      // actual_date
      {
        key: 'actual_date',
        name: 'Actual Date',
        width: 120
      },
      // actual_amount
      {
        key: 'actual_amount',
        name: 'Actual Amt',
        width: 120
      },
      // notes
      {
        key: 'notes',
        name: 'Notes',
        width: 150
      },
      // Actions: Delete button
      {
        key: 'actions',
        name: 'Actions',
        width: 80,
        formatter: ({ row }) => (
          <button
            style={{ padding: '4px 8px' }}
            onClick={() => onDeleteTransaction(row.id)}
          >
            Delete
          </button>
        ),
        // Typically no editing for actions column
        editable: false
      }
    ];
  }, [onDeleteTransaction, wbsCategories, wbsSubcategories]);

//   return (
//     <DataGrid
//       columns={columns}
//       rows={rows}
//       onRowsChange={onRowsChange}
//       rowKeyGetter={(row) => row.id}
//       rowClass={rowClass}
//       className="rdg-light"
//       // Let the grid auto-size vertically based on row count
//       autoHeight
//       // By default, columns can be sorted, resized, and are editable
//       defaultColumnOptions={{
//         resizable: true,
//         sortable: true,
//         editable: true,
//         editorOptions: {
//           // Single-click to enter edit mode
//           editOnClick: true
//         }
//       }}
//     />
//   );

//debugging code
return (
    <div style={{ width: "100%", minHeight: "500px" }}>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={onRowsChange}
        rowKeyGetter={(row) => row.id}
        rowClass={rowClass}
        className="rdg-light"
        autoHeight
        defaultColumnOptions={{
          resizable: true,
          sortable: true,
          editable: true,
          editorOptions: {
            editOnClick: true
          }
        }}
      />
    </div>
  );
  

}

export default LedgerGrid;
