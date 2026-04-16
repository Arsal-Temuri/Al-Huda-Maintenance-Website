import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SubmitRequest() {
  const [formData, setFormData] = useState({
    department: '',
    requestType: '',
    description: '',
    photo: null
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submittedId, setSubmittedId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('department', formData.department);
    data.append('requestType', formData.requestType);
    data.append('description', formData.description);
    if (formData.photo) data.append('photo', formData.photo);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        body: data,
        // credentials: "omit" not needed, default is fine
      });
      const result = await response.json();
      
      if (response.ok) {
        setSubmittedId(result.requestId);
        setFormData({ department: '', requestType: '', description: '', photo: null });
        setStatus({ type: '', message: '' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to submit' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred during submission' });
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Al Huda Product/Service Requisition Form</h1>
        </div>

        {status.message && <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{display: 'block'}}>{status.message}</div>}

        {!submittedId ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Department Name *</label>
              <input type="text" name="department" value={formData.department} onChange={handleInputChange} required placeholder="e.g., Boys Hostel, Girls Section, Library"/>
            </div>

            <div className="form-group">
              <label>Request Type *</label>
              <select name="requestType" value={formData.requestType} onChange={handleInputChange} required>
                 <option value="">-- Select Type --</option>
                 <option value="Plumbing">Plumbing</option>
                 <option value="Electrical">Electrical</option>
                 <option value="Repair">Repair</option>
                 <option value="Cleaning">Cleaning</option>
                 <option value="Carpentry">Carpentry</option>
                 <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="Please describe the issue in detail..."/>
            </div>
            
            <div className="form-group">
              <label>Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" onChange={handleInputChange} />
            </div>

            <button type="submit" className="btn btn-primary btn-full">Submit Request</button>
          </form>
        ) : (
          <div className="modal" style={{ display: 'flex', position: 'static', backgroundColor: 'transparent' }}>
            <div className="modal-content" style={{ width: '100%', margin: '0' }}>
              <div className="modal-header">
                <h2 style={{ textAlign: 'center', color: '#000', fontWeight: 900 }}>Request Submitted Successfully!</h2>
              </div>
              <p style={{ textAlign: 'center', color: '#000', marginBottom: '20px', fontWeight: 'bold' }}>
                Your maintenance request has been submitted. Please save this request ID for tracking:
              </p>
              <div className="request-id" style={{ display: 'block' }}>{submittedId}</div>
              <div className="modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => setSubmittedId(null)}>Submit Another Request</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center', color: '#000', fontWeight: 'bold' }}>
          <p>Are you an admin? <Link to="/login" style={{ color: '#000', fontWeight: 800, textDecoration: 'underline', textDecorationThickness: '2px' }}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
}