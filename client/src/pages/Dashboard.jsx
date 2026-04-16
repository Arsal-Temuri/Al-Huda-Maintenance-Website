import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal states
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, request: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, request: null });
  const [whatsappModal, setWhatsappModal] = useState({ isOpen: false, message: '', phone: '' });

  const navigate = useNavigate();

  useEffect(() => {
    // Optimistically set user from session storage to prevent "flash" effect
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
      loadWorkers();
      loadRequests();
    } catch (error) {
      console.error('Auth check failed:', error);
      sessionStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      if (response.ok && data.requests) {
        // Sort requests: newest first (descending order based on submittedAt date)
        const sortedRequests = data.requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setRequests(sortedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      showAlert('Failed to load requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      if (response.ok && data.workers) {
        setWorkers(data.workers);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error('Failed to load workers:', error);
      setWorkers([]);
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

  // Actions
  const handleVerify = async (e) => {
    e.preventDefault();
    const priority = e.target.priority.value;
    
    try {
      const response = await fetch(`/api/requests/${verifyModal.request.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      
      if (response.ok) {
        showAlert('Request verified successfully');
        setVerifyModal({ isOpen: false, request: null });
        loadRequests();
      } else {
        const error = await response.json();
        showAlert(error.error || 'Failed to verify request', 'error');
      }
    } catch (error) {
      showAlert('Failed to verify request', 'error');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const workerIdValue = e.target.worker.value;
    // Database IDs might be numbers or strings (ObjectId), so loosely compare or parse it
    const worker = workers.find(w => w.id.toString() === workerIdValue.toString());
    
    try {
      const response = await fetch(`/api/requests/${assignModal.request.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: worker.id, workerName: worker.name })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignModal({ isOpen: false, request: null });
        loadRequests();
        
        // Show whatsapp modal
        const message = `*NEW MAINTENANCE REQUEST*\n\n*ID:* ${assignModal.request.id}\n*Department:* ${assignModal.request.department}\n*Type:* ${assignModal.request.requestType}\n*Priority:* ${assignModal.request.priority}\n\n*Description:*\n${assignModal.request.description}`;
        setWhatsappModal({ isOpen: true, message, phone: worker.phone });
      } else {
        const error = await response.json();
        showAlert(error.error || 'Failed to assign worker', 'error');
      }
    } catch (error) {
      showAlert('Failed to assign worker', 'error');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Are you sure you want to mark this request as completed?')) return;
    
    try {
      const response = await fetch(`/api/requests/${id}/complete`, { method: 'POST' });
      if (response.ok) {
        showAlert('Request marked as completed');
        loadRequests();
      } else {
        showAlert('Failed to complete request', 'error');
      }
    } catch (error) {
      showAlert('Failed to complete request', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      const url = filter === 'all' ? '/api/export/requests' : `/api/export/requests?status=${filter}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
      showAlert('Failed to export to Excel', 'error');
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredRequests.map(req => req.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelectedRequests = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} request(s)? This cannot be undone.`)) return;

    try {
      const response = await fetch('/api/requests/delete-multiple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (response.ok) {
        showAlert(`Successfully deleted ${selectedIds.length} request(s)`);
        setSelectedIds([]);
        loadRequests();
      } else {
        const error = await response.json();
        showAlert(error.error || 'Failed to delete requests', 'error');
      }
    } catch (error) {
      showAlert('Failed to delete requests', 'error');
    }
  };

  // Select logic for deletions if needed (skipped for brevity unless requested)

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    inProgress: requests.filter(r => r.status === 'Assigned').length,
    completed: requests.filter(r => r.status === 'Completed').length
  };

  return (
    <div className="container">
      <div className="navbar">
        <h2>Admin Dashboard</h2>
        <div className="user-info">
          <span className="user-name" style={{ marginRight: '15px' }}>
            {currentUser?.name || currentUser?.username || 'Loading...'}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-number">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-number">{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{stats.completed}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Maintenance Requests</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedIds.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={deleteSelectedRequests}>
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-success btn-sm" onClick={handleExportExcel}>
              Export to Excel
            </button>
            <Link to="/history" className="btn btn-secondary btn-sm">View History</Link>
            <button className="btn btn-primary btn-sm" onClick={loadRequests}>Refresh</button>
          </div>
        </div>

        <div className="filter-buttons" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['all', 'Pending', 'Verified', 'Assigned'].map(f => (
            <button 
              key={f} 
              className={`btn btn-warning ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
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
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                  />
                </th>
                <th>Request ID</th>
                <th>Department</th>
                <th>Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Worker</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{textAlign: 'center'}}>Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="10" style={{textAlign: 'center'}}>No requests found.</td></tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(req.id)}
                        onChange={() => toggleSelection(req.id)}
                      />
                    </td>
                    <td><strong>{req.id}</strong></td>
                    <td>{req.department}</td>
                    <td>{req.requestType}</td>
                    <td title={req.description}>
                      {req.description.length > 50 ? req.description.substring(0, 50) + '...' : req.description}
                    </td>
                    <td><span className={`badge priority-${req.priority.toLowerCase()}`}>{req.priority}</span></td>
                    <td><span className={`badge status-${req.status.toLowerCase()}`}>{req.status}</span></td>
                    <td>{req.assignedWorker ? req.assignedWorker.name : 'Unassigned'}</td>
                    <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                    <td>
                      {/* Action logic */}
                      {req.status === 'Pending' && currentUser?.role === 'female_admin' && (
                        <button className="btn btn-success btn-sm" onClick={() => setVerifyModal({ isOpen: true, request: req })}>
                          ✓ Verify
                        </button>
                      )}
                      {req.status === 'Verified' && currentUser?.role === 'male_admin' && (
                        <button className="btn btn-warning btn-sm" onClick={() => setAssignModal({ isOpen: true, request: req })}>
                          Assign Worker
                        </button>
                      )}
                      {req.status === 'Assigned' && currentUser?.role === 'male_admin' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleComplete(req.id)}>
                          ✓ Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyModal.isOpen && (
        <div className="modal" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Verify Request & Set Priority</h2>
            </div>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>Request Details:</label>
                <div className="neo-panel" style={{ padding: '15px', marginBottom: '20px' }}>
                  <p><strong>ID:</strong> {verifyModal.request.id}</p>
                  <p><strong>Department:</strong> {verifyModal.request.department}</p>
                  <p><strong>Type:</strong> {verifyModal.request.requestType}</p>
                  <p><strong>Description:</strong> {verifyModal.request.description}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Set Priority *</label>
                <select name="priority" required>
                  <option value="">-- Select Priority --</option>
                  <option value="Low">Low - Can wait</option>
                  <option value="Medium">Medium - Soon</option>
                  <option value="High">High - Important</option>
                  <option value="Urgent">Urgent - Immediate attention</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setVerifyModal({ isOpen: false, request: null })}>Cancel</button>
                <button type="submit" className="btn btn-success">Verify Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal.isOpen && (
        <div className="modal" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Worker</h2>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label>Request Details:</label>
                <div className="neo-panel" style={{ padding: '15px', marginBottom: '20px' }}>
                  <p><strong>ID:</strong> {assignModal.request.id}</p>
                  <p><strong>Priority:</strong> {assignModal.request.priority}</p>
                  <p><strong>Type:</strong> {assignModal.request.requestType}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Select Worker *</label>
                <select name="worker" required>
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role || w.specialty})</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModal({ isOpen: false, request: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {whatsappModal.isOpen && (
        <div className="modal" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Worker Assigned Successfully</h2>
            </div>
            <div className="neo-panel" style={{ padding: '20px' }}>
              <p style={{ color: '#000', fontWeight: 800, marginBottom: '15px' }}>Send this message to the worker via WhatsApp:</p>
              <div style={{ background: '#fff', padding: '15px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9em', whiteSpace: 'pre-wrap', color: '#000' }}>
                {whatsappModal.message}
              </div>
              <p style={{ color: '#000', marginTop: '15px', fontSize: '0.9em', fontWeight: 'bold' }}>
                <strong>Worker Phone:</strong> {whatsappModal.phone}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setWhatsappModal({ isOpen: false, message: '', phone: '' })}>Got it!</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}