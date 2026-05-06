import React from 'react';
import { Users, FileText, MessageSquare, Filter, User, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-canvas">
      {/* Summary Grid */}
      <section className="summary-grid">
        <div className="summary-card hover-shadow">
          <div className="card-header">
            <span className="material-icon text-secondary"><Users size={32} /></span>
          </div>
          <div className="card-body">
            <h4 className="card-label">Total Students Assigned</h4>
            <span className="card-value text-primary">12</span>
          </div>
        </div>
        
        <div className="summary-card hover-shadow">
          <div className="card-header">
            <span className="material-icon text-error"><FileText size={32} /></span>
            <span className="urgent-badge">URGENT</span>
          </div>
          <div className="card-body">
            <h4 className="card-label">Reports Pending Review</h4>
            <span className="card-value text-primary">5</span>
          </div>
        </div>

        <div className="summary-card hover-shadow">
          <div className="card-header">
            <span className="material-icon text-secondary"><MessageSquare size={32} /></span>
          </div>
          <div className="card-body">
            <h4 className="card-label">Unread Messages</h4>
            <span className="card-value text-primary">3</span>
          </div>
        </div>
      </section>

      {/* Assigned Students Section */}
      <section className="students-section">
        <div className="section-header">
          <h2 className="section-title">Assigned Students</h2>
          <button className="btn-filter">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="students-list">
          {/* Jordan Smith */}
          <div className="student-card hover-shadow">
            <div className="student-avatar">
              <User size={32} className="text-primary" />
            </div>
            <div className="student-info-grid">
              <div>
                <h3 className="student-name">Jordan Smith</h3>
                <p className="student-phase">Phase 1 - Clinical</p>
              </div>
              <div className="student-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percent">65%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="student-status">
                <span className="status-badge ready">Report Ready</span>
              </div>
              <div className="student-action">
                <button className="btn-action primary">Review Report</button>
              </div>
            </div>
          </div>

          {/* Elena Rodriguez */}
          <div className="student-card hover-shadow">
            <div className="student-avatar">
              <UserCheck size={32} className="text-primary" />
            </div>
            <div className="student-info-grid">
              <div>
                <h3 className="student-name">Elena Rodriguez</h3>
                <p className="student-phase">Phase 2 - Advanced</p>
              </div>
              <div className="student-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percent">82%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div className="student-status">
                <span className="status-badge active">Active</span>
              </div>
              <div className="student-action">
                <button className="btn-action outline">View Profile</button>
              </div>
            </div>
          </div>

          {/* Marcus Chen */}
          <div className="student-card hover-shadow">
            <div className="student-avatar">
              <User size={32} className="text-primary" />
            </div>
            <div className="student-info-grid">
              <div>
                <h3 className="student-name">Marcus Chen</h3>
                <p className="student-phase">Phase 1 - Clinical</p>
              </div>
              <div className="student-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percent">30%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="student-status">
                <span className="status-badge active">Active</span>
              </div>
              <div className="student-action">
                <button className="btn-action outline">View Profile</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Academic Element: Professional Timeline Preview */}
      <section className="milestones-section">
        <div className="milestones-container">
          <div className="milestones-bg-image"></div>
          <div className="milestones-content">
            <h2 className="milestones-title">Upcoming Field Milestones</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot primary"></div>
                <h4 className="timeline-item-title">Clinical Proficiency Assessment</h4>
                <p className="timeline-item-desc">Scheduled for next Friday. 8 students eligible for evaluation.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot secondary"></div>
                <h4 className="timeline-item-title dim">Final Thesis Submission</h4>
                <p className="timeline-item-desc dim">Phase 2 students reaching completion status in 14 days.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupervisorDashboard;
