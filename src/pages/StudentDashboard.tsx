import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Welcome, Student Name</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Here's an overview of your cooperative training progress.</p>
      </div>

      <div className="grid-3">
        <div className="card stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>4</h3>
            <p>Reports Approved</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', color: '#f39c12' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>1</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#2980b9' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Week 6</h3>
            <p>Current Stage</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '32px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Recent Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
              <CheckCircle size={20} color="#27ae60" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 500, margin: '0 0 4px 0' }}>Week 4 Report Approved</p>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Your supervisor has approved your weekly report.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
              <AlertCircle size={20} color="#f39c12" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 500, margin: '0 0 4px 0' }}>Week 5 Report Due Soon</p>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Please submit your weekly report by Friday.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
          <FileText size={48} color="var(--color-teal)" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Submit Your Report</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>It's time to submit your report for Week 5 of your training.</p>
          <button className="btn btn-primary" onClick={() => navigate('/student/reports')}>
            Submit Weekly Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
