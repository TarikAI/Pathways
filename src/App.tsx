import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ReportSubmission from './pages/ReportSubmission';
import Messages from './pages/Messages';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const AppLayout = ({ children, role }: { children: React.ReactNode, role: string }) => {
  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <Topbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<AppLayout role="student"><StudentDashboard /></AppLayout>} />
        <Route path="/student/reports" element={<AppLayout role="student"><ReportSubmission /></AppLayout>} />
        <Route path="/student/messages" element={<AppLayout role="student"><Messages /></AppLayout>} />
        
        {/* Supervisor Routes */}
        <Route path="/supervisor/dashboard" element={<AppLayout role="supervisor"><SupervisorDashboard /></AppLayout>} />
        <Route path="/supervisor/messages" element={<AppLayout role="supervisor"><Messages /></AppLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
