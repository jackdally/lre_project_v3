// src/components/Sidebar.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaListAlt, FaHistory } from "react-icons/fa"; // Icons for links
import "./Sidebar.css"; // Import CSS for styling

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation Links */}
      <nav>
        <NavLink to="/" activeClassName="active">
          <FaHome />
          <span>Home</span> {/* ✅ Text hides when collapsed */}
        </NavLink>
        <NavLink to="/programs-manage" activeClassName="active">
          <FaListAlt />
          <span>Manage Programs</span>
        </NavLink>
        <NavLink to="/edit-history" activeClassName="active">
          <FaHistory />
          <span>Edit History</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
