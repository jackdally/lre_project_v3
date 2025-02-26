// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the pages
import LandingPage from "./pages/LandingPage";
import ProgramDashboard from "./pages/ProgramDashboard";
import LedgerPage from "./pages/LedgerPage";
import WbsCodesPage from "./pages/WbsCodesPage";
import EditHistoryPage from "./pages/EditHistoryPage";
import ProgramsPage from "./pages/ProgramsPage";

// Import Global Layout
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/:programId" element={<ProgramDashboard />} />
          <Route path="/ledger/:programId" element={<LedgerPage />} />
          <Route path="/wbs/:programId" element={<WbsCodesPage />} />
          <Route path="/programs-manage" element={<ProgramsPage />} />
          <Route path="/edit-history" element={<EditHistoryPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
