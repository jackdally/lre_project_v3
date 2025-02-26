// src/pages/LandingPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBold } from 'react-icons/fa';

function LandingPage() {
  const [programs, setPrograms] = useState([]);
  const [hideInactive, setHideInactive] = useState(true);

  // Track which program is hovered & the mouse position for the tooltip
  const [hoveredProgramId, setHoveredProgramId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8000/programs/')
      .then((response) => setPrograms(response.data))
      .catch((error) => console.error('Error fetching programs:', error));
  }, []);

  const toggleHideInactive = () => {
    setHideInactive(!hideInactive);
  };

  // Filter if 'hideInactive' is true
  const displayedPrograms = hideInactive
    ? programs.filter(
        (p) => p.program_status?.toLowerCase() !== 'inactive'
      )
    : programs;

  // Row or button click => navigate
  const handleProgramClick = (programId) => {
    navigate(`/dashboard/${programId}`);
  };

  // Prevent row click if the button is clicked (to avoid double navigation)
  const handleButtonClick = (e, programId) => {
    e.stopPropagation();
    handleProgramClick(programId);
  };

  return (
    <div className="content" style={{ maxWidth: '80%', margin: '0 auto' }}>
      <h1>Programs</h1>

      <button onClick={toggleHideInactive} style={{ marginBottom: '1rem' }}>
        {hideInactive ? 'Show Inactive Programs' : 'Hide Inactive Programs'}
      </button>

      {/* 
        A container that doesn't clip the tooltip. 
        We'll place the tooltip absolutely with 'position: fixed' 
        so it stays visible even outside the table container.
      */}
      <div style={{ position: 'relative' }}>
        <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
          <table
            style={{
              border: '1px solid #ccc',
              borderCollapse: 'collapse',
              width: '100%'
            }}
          >
            <thead>
              <tr>
                {/* Removed the ID column */}
                <th style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'left' }}>
                  Name
                </th>
                <th style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'left' }}>
                  Code
                </th>
                <th style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'left' }}>
                  Description
                </th>
                {/* Program Manager column */}
                <th style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'left' }}>
                  Program Manager
                </th>                
                {/* Program Budget */}
                <th style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                  Program Budget
                </th>
                <th style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                  Status
                </th>
                {/* Actions column */}
                <th style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedPrograms.map((program) => {
                const statusLower = program.program_status?.toLowerCase() || '';
                const isInactive = statusLower === 'inactive';
                const rowBackground = isInactive ? '#eee' : '#d9edff';

                // If hovered, row gets highlight color
                const isHovered = hoveredProgramId === program.id;
                // const hoverColor = isHovered ? '#E6E6FA' : rowBackground;
                const hoverColor = isHovered ? ( isInactive ? '#ccc' : '#c2e0ff') : rowBackground;


                return (
                  <tr
                    key={program.id}
                    onClick={() => handleProgramClick(program.id)}
                    style={{
                      backgroundColor: hoverColor,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    // Mouse events for tooltip
                    onMouseEnter={() => setHoveredProgramId(program.id)}
                    onMouseLeave={() => setHoveredProgramId(null)}
                    onMouseMove={(e) =>
                      setTooltipPos({ x: e.clientX, y: e.clientY })
                    }
                  >
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                      {program.program_name}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                      {program.program_code}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                      {program.program_description}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                      {program.program_manager}
                    </td>
                    {/* Show Budget or 'N/A' */}
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem' }}>
                      {program.program_budget ?? 'N/A'}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'center' }}>
                      {program.program_status}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '1.5rem', textAlign: 'center' }}>
                      <button
                        onClick={(e) => handleButtonClick(e, program.id)}
                      >
                        View Program
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 
          Tooltip displayed if hoveredProgramId is set.
          position: fixed => no clipping from table container.
          We offset by +15 so it doesn't hide under the mouse.
        */}
        {hoveredProgramId && (
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.y + 15,
              left: tooltipPos.x + 15,
              zIndex: 9999,
              background: '#fff',
              border: '1px solid #ccc',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              padding: '1rem',
              pointerEvents: 'none' // so it doesn't block mouse
            }}
          >
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                    Program Budget
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {
                      displayedPrograms.find((p) => p.id === hoveredProgramId)
                        ?.program_budget ?? 'N/A'
                    }
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>EAC</td>
                  <td style={{ padding: '0.5rem' }}>
                    {
                      displayedPrograms.find((p) => p.id === hoveredProgramId)
                        ?.eac ?? 'N/A'
                    }
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                    % Spent
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {
                      displayedPrograms.find((p) => p.id === hoveredProgramId)
                        ?.percent_spent ?? 'N/A'
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
