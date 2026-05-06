import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, FileText, MessageSquare, Settings, Users, ClipboardList } from 'lucide-react';

const Sidebar = ({ role }: { role: string }) => {
  const location = useLocation();

  const studentLinks = [
    { path: '/student/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/student/reports', icon: <FileText size={20} />, label: 'Submit Report' },
    { path: '/student/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
  ];

  const supervisorLinks = [
    { path: '/supervisor/dashboard', icon: <Home size={20} />, label: 'Overview' },
    { path: '/supervisor/students', icon: <Users size={20} />, label: 'My Students' },
    { path: '/supervisor/reports', icon: <ClipboardList size={20} />, label: 'Pending Reports' },
    { path: '/supervisor/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
  ];

  const links = role === 'student' ? studentLinks : supervisorLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={28} />
        <span>Pathways</span>
      </div>
      <div className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
      <div className="sidebar-nav" style={{ flex: 0, paddingBottom: '24px' }}>
        <Link to="/settings" className="nav-item">
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
