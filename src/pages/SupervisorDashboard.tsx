import React from 'react';
import { Users, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Supervisor Overview</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Manage your assigned students and review reports.</p>
      </div>

      <div className="grid-3">
        <div className="card stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Assigned Students</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', color: '#f39c12' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>8</h3>
            <p>Pending Reports</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#2980b9' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <h3>3</h3>
            <p>Unread Messages</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px' }}>My Students</h2>
          <button className="btn btn-outline" style={{ padding: '6px 12px' }}>View All</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>ID Number</th>
              <th>Company / Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Ali</td>
              <td>201900123</td>
              <td>Tech Solutions Inc.</td>
              <td><span className="badge badge-success">Active</span></td>
              <td>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View Profile</button>
              </td>
            </tr>
            <tr>
              <td>Sara Khalid</td>
              <td>201900456</td>
              <td>Innovate Labs</td>
              <td><span className="badge badge-warning">Report Pending</span></td>
              <td>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Review Report</button>
              </td>
            </tr>
            <tr>
              <td>Omar Hassan</td>
              <td>201900789</td>
              <td>Global Systems</td>
              <td><span className="badge badge-success">Active</span></td>
              <td>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View Profile</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
