// src/pages/EditHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditHistoryPage() {
  const [editHistory, setEditHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100; // Show 100 records per page
  const navigate = useNavigate();

  // Fetch edit history logs from the backend
  const fetchEditHistory = (page = 1) => {
    const skip = (page - 1) * recordsPerPage;
    axios.get(`http://localhost:8000/edit_history/?skip=${skip}&limit=${recordsPerPage}`)
      .then(response => {
        setEditHistory(response.data);
      })
      .catch(error => console.error('Error fetching edit history:', error));
  };

  useEffect(() => {
    fetchEditHistory(currentPage);
  }, [currentPage]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Edit History</h1>

      {/* Back button to return to Program Dashboard */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>Back to Program Dashboard</button>
      </div>

      {/* Display Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Edited By</th>
            <th>Edited At</th>
            <th>Field Changed</th>
            <th>Old Value</th>
            <th>New Value</th>
            <th>Record ID</th>
            <th>Table Name</th>
          </tr>
        </thead>
        <tbody>
          {editHistory.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.edited_by}</td>
              <td>{new Date(item.edited_at).toLocaleString()}</td>
              <td>{item.field_changed}</td>
              <td>{item.old_value || 'N/A'}</td>
              <td>{item.new_value || 'N/A'}</td>
              <td>{item.record_id}</td>
              <td>{item.table_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ marginRight: '1rem' }}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={editHistory.length < recordsPerPage} 
          style={{ marginLeft: '1rem' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default EditHistoryPage;
