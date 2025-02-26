// src/components/NavigationBar.js
import React from 'react';
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/programs-manage" style={{ marginRight: '1rem' }}>Manage Programs</Link>
      <Link to="/edit-history" style={{ marginRight: '1rem' }}>Edit History</Link>
    </nav>
  );
}

export default NavigationBar;
