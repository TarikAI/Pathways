import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-navy)' }}>
          <Bell size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="var(--color-navy)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>User Name</span>
            <span style={{ fontSize: '12px', color: '#666' }}>Role</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', marginLeft: '10px' }}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
