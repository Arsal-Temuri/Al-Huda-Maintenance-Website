import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function History() {
  const [currentUser, setCurrentUser] = useState(null);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '' });
  
  // Modal state
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, request: null });

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('adminUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (!data.authenticated) {
        sessionStorage.removeItem('adminUser');
        navigate('/login');
        return;
      }
      
      setCurrentUser(data.admin);
      sessionStorage.setItem('adminUser', JSON.stringify(data.admin));
      loadHistory();
    } catch (error) {
      console.error('Auth check failed:', error);
      sessionStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      if (response.ok && data.requests) {
        // Filter only completed tasks based on the vanilla implementation context
        const completed = data.requests.filter(req => req.status === 'Completed');
        // Sort requests: newest first (descending order based on completedAt or submittedAt date)
        const sortedCompleted = completed.sort((a, b) => new Date(b.completedAt || b.submittedAt) - new Date(a.completedAt || a.submittedAt));
        setCompletedRequests(sortedCompleted);
      } else {
        setCompletedRequests([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      showAlert('Failed to load history', 'error');
      setCompletedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      sessionStorage.removeItem('adminUser');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  // Helper for duration
  const getDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffHours = Math.abs(endDate - startDate) / 36e5;
    if (diffHours < 24) return `${Math.floor(diffHours)} hrs`;
    return `${Math.floor(diffHours / 24)} days`;
  };

  return (
    <div className="container">
      <div className="navbar">
        <h2>Task History</h2>
        <div className="user-info">
          <span className="user-name" style={{ marginRight: '15px' }}>
            {currentUser?.name || currentUser?.username || 'Loading...'}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Completed Maintenance Requests</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/dashboard" className="btn btn-secondary btn-sm">Back to Dashboard</Link>
            <button className="btn btn-primary btn-sm" onClick={loadHistory}>Refresh</button>
          </div>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{display: 'block'}}>
            {alert.message}
          </div>
        )}

        <div className="table-container">
          <table id="requestsTable">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Department</th>
                <th>Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Assigned Worker</th>
                <th>Submitted</th>
                <th>Completed</th>
                <th>Duration</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{textAlign: 'center'}}>Loading completed tasks...</td></tr>
              ) : completedRequests.length === 0 ? (
                <tr><td colSpan="10" style={{textAlign: 'center'}}>No completed requests found.</td></tr>
              ) : (
                completedRequests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td>{req.department}</td>
                    <td>{req.requestType}</td>
                    <td title={req.description}>
                      {req.description.length > 50 ? req.description.substring(0, 50) + '...' : req.description}
                    </td>
                    <td><span className={`badge priority-${req.priority.toLowerCase()}`}>{req.priority}</span></td>
                    <td>{req.assignedWorker ? req.assignedWorker.name : 'Unknown'}</td>
                    <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                    <td>{req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>{getDuration(req.submittedAt, req.completedAt)}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setDetailsModal({ isOpen: true, request: req })}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal.isOpen && (
        <div className="modal" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Request Details</h2>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => setDetailsModal({ isOpen: false, request: null })}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <div className="neo-panel" style={{ padding: '15px' }}>
                <p><strong>ID:</strong> {detailsModal.request.id}</p>
                <p><strong>Status:</strong> {detailsModal.request.status}</p>
                <p><strong>Department:</strong> {detailsModal.request.department}</p>
                <p><strong>Request Type:</strong> {detailsModal.request.requestType}</p>
                <p><strong>Priority:</strong> {detailsModal.request.priority}</p>
                <hr style={{ margin: '15px 0', border: '1px dashed #000' }} />
                <p><strong>Description:</strong></p>
                <p style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000', borderRadius: '4px' }}>{detailsModal.request.description}</p>
                <hr style={{ margin: '15px 0', border: '1px dashed #000' }} />
                <p><strong>Assigned Worker:</strong> {detailsModal.request.assignedWorker?.name || 'N/A'}</p>
                {detailsModal.request.photo && (
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>Photo:</strong></p>
                    <img src={detailsModal.request.photo} alt="Request" style={{ maxWidth: '100%', border: '3px solid #000', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailsModal({ isOpen: false, request: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}