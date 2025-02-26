// src/pages/LandingPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LandingPage() {
  const [programs, setPrograms] = useState([]);
  const [hideInactive, setHideInactive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all programs from the API
    axios
      .get('http://localhost:8000/programs/')
      .then((response) => setPrograms(response.data))
      .catch((error) => console.error('Error fetching programs:', error));
  }, []);

  // When a program is clicked, navigate to its dashboard
  const handleProgramClick = (programId) => {
    navigate(`/dashboard/${programId}`);
  };

  // Toggle the inactive status
  const toggleHideInactive = () => {
    setHideInactive(!hideInactive);
  };

  // Filter programs based on hideInactive state
  const displayedPrograms = hideInactive
    ? programs.filter((program) => program.program_status.toLowerCase() !== 'inactive')
    : programs;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Programs</h1>

      {/* Button to toggle hide/show inactive programs */}
      <button onClick={toggleHideInactive} style={{ marginBottom: '1rem' }}>
        {hideInactive ? 'Show Inactive Programs' : 'Hide Inactive Programs'}
      </button>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th>Manager</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedPrograms.map((program) => (
            <tr
              key={program.id}
              onClick={() => handleProgramClick(program.id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{program.id}</td>
              <td>{program.program_name}</td>
              <td>{program.program_code}</td>
              <td>{program.program_description}</td>
              <td>{program.program_manager}</td>
              <td>{program.program_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LandingPage;
