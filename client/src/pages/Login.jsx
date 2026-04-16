import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('adminUser', JSON.stringify(data.admin));
        navigate('/dashboard');
      } else {
        setStatus({ type: 'error', message: data.error || 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred during login' });
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '100px auto' }}>
        <div className="header">
          <h1>Admin Login</h1>
          <p>Al Huda Maintenance Management System</p>
        </div>

        {status.message && <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{display: 'block'}}>{status.message}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username" autoComplete="username"/>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" autoComplete="current-password"/>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Login
          </button>
        </form>

        <div className="neo-panel" style={{ marginTop: '30px', padding: '20px' }}>
          <p style={{ color: '#000', fontWeight: 800, marginBottom: '10px', fontSize: '1.1em' }}>Default Credentials (Demo):</p>
          <p style={{ color: '#000', fontSize: '0.9em', margin: '5px 0', fontWeight: 'bold' }}>
            <strong>Female Admin:</strong> female_admin / admin123
          </p>
          <p style={{ color: '#000', fontSize: '0.9em', margin: '5px 0', fontWeight: 'bold' }}>
            <strong>Male Admin:</strong> male_admin / admin123
          </p>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#000', fontWeight: 'bold' }}>
          <p><Link to="/" style={{ color: '#000', fontWeight: 800, textDecoration: 'underline', textDecorationThickness: '2px' }}>Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}