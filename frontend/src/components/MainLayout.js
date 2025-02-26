// src/components/MainLayout.js
import React from "react";
import Sidebar from "./Sidebar"; // Import the Sidebar
import "./MainLayout.css"; // Import Global Styles

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="content">{children}</main>
    </div>
  );
};

export default MainLayout;
