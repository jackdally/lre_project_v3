import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaListAlt, FaHistory } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav>
        {/* Use a function for className */}
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          <FaHome />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/programs-manage"
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          <FaListAlt />
          <span>Manage Programs</span>
        </NavLink>

        <NavLink
          to="/edit-history"
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          <FaHistory />
          <span>Edit History</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
