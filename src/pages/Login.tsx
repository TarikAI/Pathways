import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/supervisor/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <BookOpen size={64} style={{ marginBottom: '24px' }} />
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>Pathways</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.5 }}>
            Your digital platform for managing cooperative and field training seamlessly.
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="card login-card">
          <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">User Role</label>
              <select 
                className="form-control" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="supervisor">Academic/Field Supervisor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="Enter your university email" required />
            </div>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              <LogIn size={20} />
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
