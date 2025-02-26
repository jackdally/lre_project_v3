// src/pages/ProgramsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [newProgram, setNewProgram] = useState({
    program_name: '',
    program_code: '',
    program_description: '',
    program_status: 'Active',
    program_manager: ''
  });
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [editingProgramData, setEditingProgramData] = useState({});

  // Fetch programs from the backend
  const fetchPrograms = () => {
    axios.get('http://localhost:8000/programs/')
      .then(response => setPrograms(response.data))
      .catch(error => console.error('Error fetching programs:', error));
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Handle new program form input change
  const handleNewProgramChange = (e) => {
    setNewProgram({ ...newProgram, [e.target.name]: e.target.value });
  };

  // Submit new program
  const handleAddProgram = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/programs/', newProgram)
      .then(() => {
        fetchPrograms();  // Refresh list
        // Reset form fields
        setNewProgram({
          program_name: '',
          program_code: '',
          program_description: '',
          program_status: 'Active',
          program_manager: ''
        });
      })
      .catch(error => console.error('Error adding program:', error));
  };

  // Start inline editing for a program
  const handleEditClick = (program) => {
    setEditingProgramId(program.id);
    setEditingProgramData(program);
  };

  // Handle changes in the inline edit fields
  const handleEditChange = (e) => {
    setEditingProgramData({ ...editingProgramData, [e.target.name]: e.target.value });
  };

  // Submit the update for a program
  const handleUpdateProgram = (id) => {
    axios.put(`http://localhost:8000/programs/${id}`, editingProgramData)
      .then(() => {
        setEditingProgramId(null);
        fetchPrograms();
      })
      .catch(error => console.error('Error updating program:', error));
  };

  // Delete a program
  const handleDeleteProgram = (id) => {
    axios.delete(`http://localhost:8000/programs/${id}`)
      .then(() => fetchPrograms())
      .catch(error => console.error('Error deleting program:', error));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Manage Programs</h1>

      {/* Form to add a new program */}
      <h2>Add New Program</h2>
      <form onSubmit={handleAddProgram} style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          name="program_name" 
          placeholder="Program Name" 
          value={newProgram.program_name} 
          onChange={handleNewProgramChange} 
          required 
          style={{ marginRight: '0.5rem' }}
        />
        <input 
          type="text" 
          name="program_code" 
          placeholder="Program Code" 
          value={newProgram.program_code} 
          onChange={handleNewProgramChange} 
          required 
          style={{ marginRight: '0.5rem' }}
        />
        <input 
          type="text" 
          name="program_description" 
          placeholder="Description" 
          value={newProgram.program_description} 
          onChange={handleNewProgramChange} 
          style={{ marginRight: '0.5rem' }}
        />
        <input 
          type="text" 
          name="program_manager" 
          placeholder="Program Manager" 
          value={newProgram.program_manager} 
          onChange={handleNewProgramChange} 
          required 
          style={{ marginRight: '0.5rem' }}
        />
        <select 
          name="program_status" 
          value={newProgram.program_status} 
          onChange={handleNewProgramChange} 
          style={{ marginRight: '0.5rem' }}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button type="submit">Add Program</button>
      </form>

      {/* Table listing programs */}
      <h2>Programs List</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th>Manager</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.map(program => (
            <tr key={program.id}>
              <td>{program.id}</td>
              <td>
                {editingProgramId === program.id ? (
                  <input 
                    type="text" 
                    name="program_name" 
                    value={editingProgramData.program_name} 
                    onChange={handleEditChange}
                  />
                ) : (
                  program.program_name
                )}
              </td>
              <td>
                {editingProgramId === program.id ? (
                  <input 
                    type="text" 
                    name="program_code" 
                    value={editingProgramData.program_code} 
                    onChange={handleEditChange}
                  />
                ) : (
                  program.program_code
                )}
              </td>
              <td>
                {editingProgramId === program.id ? (
                  <input 
                    type="text" 
                    name="program_description" 
                    value={editingProgramData.program_description} 
                    onChange={handleEditChange}
                  />
                ) : (
                  program.program_description
                )}
              </td>
              <td>
                {editingProgramId === program.id ? (
                  <input 
                    type="text" 
                    name="program_manager" 
                    value={editingProgramData.program_manager} 
                    onChange={handleEditChange}
                  />
                ) : (
                  program.program_manager
                )}
              </td>
              <td>
                {editingProgramId === program.id ? (
                  <select 
                    name="program_status" 
                    value={editingProgramData.program_status} 
                    onChange={handleEditChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  program.program_status
                )}
              </td>
              <td>
                {editingProgramId === program.id ? (
                  <>
                    <button onClick={() => handleUpdateProgram(program.id)}>Save</button>
                    <button onClick={() => setEditingProgramId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditClick(program)}>Edit</button>
                    <button onClick={() => handleDeleteProgram(program.id)}>Delete</button>
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

export default ProgramsPage;
