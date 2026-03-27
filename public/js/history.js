let currentUser = null;
let completedRequests = [];

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadHistory();
});

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check');
    const data = await response.json();
    
    if (!data.authenticated) {
      window.location.href = '/login.html';
      return;
    }
    
    currentUser = data.admin;
    document.getElementById('userName').textContent = data.admin.name || data.admin.username;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/login.html';
  }
}

async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

async function loadHistory() {
  try {
    const response = await fetch('/api/requests');
    const data = await response.json();
    
    // Filter only completed requests
    completedRequests = data.requests.filter(r => r.status === 'Completed');
    
    updateStats();
    displayHistory(completedRequests);
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

function updateStats() {
  const total = completedRequests.length;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const todayCount = completedRequests.filter(r => 
    new Date(r.completedAt) >= today
  ).length;
  
  const weekCount = completedRequests.filter(r => 
    new Date(r.completedAt) >= weekAgo
  ).length;
  
  const monthCount = completedRequests.filter(r => 
    new Date(r.completedAt) >= monthStart
  ).length;
  
  document.getElementById('completedCount').textContent = total;
  document.getElementById('todayCount').textContent = todayCount;
  document.getElementById('weekCount').textContent = weekCount;
  document.getElementById('monthCount').textContent = monthCount;
}

function displayHistory(requests) {
  const tbody = document.getElementById('historyTableBody');
  
  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No completed tasks yet</td></tr>';
    const selectAllCb = document.getElementById('selectAllCheckbox');
    if (selectAllCb) selectAllCb.checked = false;
    if (typeof toggleSelection === 'function') toggleSelection();
    return;
  }
  
  // Sort by completion date (newest first)
  requests.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  
  tbody.innerHTML = requests.map(request => {
    const duration = calculateDuration(request.submittedAt, request.completedAt);
    const workerInfo = request.assignedWorker 
      ? `${request.assignedWorker.name} (${request.assignedWorker.role})`
      : 'N/A';
    
    return `
      <tr>
        <td style="text-align: center;">
          <input type="checkbox" class="request-checkbox" value="${request.id}" onchange="toggleSelection()">
        </td>
        <td data-label="Request ID"><strong>${request.id}</strong></td>
        <td data-label="Department">${request.department}</td>
        <td data-label="Type">${request.requestType}</td>
        <td data-label="Description" style="max-width: 200px;">${truncate(request.description, 50)}</td>
        <td data-label="Priority"><span class="badge badge-${request.priority.toLowerCase()}">${request.priority}</span></td>
        <td data-label="Worker">${workerInfo}</td>
        <td data-label="Submitted">${formatDate(request.submittedAt)}</td>
        <td data-label="Completed">${formatDate(request.completedAt)}</td>
        <td data-label="Duration">${duration}</td>
        <td data-label="Actions">
          <button class="btn btn-secondary btn-sm" onclick="showDetails('${request.id}')">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  // Reset select all checkbox and delete button state
  const selectAllCb = document.getElementById('selectAllCheckbox');
  if (selectAllCb) selectAllCb.checked = false;
  if (typeof toggleSelection === 'function') toggleSelection();
}

function showDetails(requestId) {
  const request = completedRequests.find(r => r.id === requestId);
  if (!request) return;
  
  const detailsHtml = `
    <div class="detail-group">
      <label>Request ID:</label>
      <p class="detail-value"><strong>${request.id}</strong></p>
    </div>
    
    <div class="detail-group">
      <label>Department:</label>
      <p class="detail-value">${request.department}</p>
    </div>
    
    <div class="detail-group">
      <label>Request Type:</label>
      <p class="detail-value">${request.requestType}</p>
    </div>
    
    <div class="detail-group">
      <label>Priority:</label>
      <p class="detail-value"><span class="badge ${request.priority.toLowerCase()}">${request.priority}</span></p>
    </div>
    
    <div class="detail-group">
      <label>Description:</label>
      <p class="detail-value">${request.description}</p>
    </div>
    
    <div class="detail-group">
      <label>Assigned Worker:</label>
      <p class="detail-value">${request.assignedWorker ? `${request.assignedWorker.name} (${request.assignedWorker.role})` : 'N/A'}</p>
    </div>
    
    <div class="detail-separator"></div>
    
    <div class="detail-group">
      <label>Submitted:</label>
      <p class="detail-value">${formatFullDate(request.submittedAt)}</p>
    </div>
    
    ${request.verifiedAt ? `
      <div class="detail-group">
        <label>Verified:</label>
        <p class="detail-value">${formatFullDate(request.verifiedAt)} by ${request.verifiedBy || 'N/A'}</p>
      </div>
    ` : ''}
    
    ${request.assignedAt ? `
      <div class="detail-group">
        <label>Assigned:</label>
        <p class="detail-value">${formatFullDate(request.assignedAt)} by ${request.assignedBy || 'N/A'}</p>
      </div>
    ` : ''}
    
    <div class="detail-group">
      <label>Completed:</label>
      <p class="detail-value">${formatFullDate(request.completedAt)} by ${request.completedBy || 'N/A'}</p>
    </div>
    
    <div class="detail-group">
      <label>Total Duration:</label>
      <p class="detail-value"><strong>${calculateDuration(request.submittedAt, request.completedAt)}</strong></p>
    </div>
  `;
  
  document.getElementById('requestDetails').innerHTML = detailsHtml;
  document.getElementById('detailsModal').classList.add('show');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('show');
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Export to Excel function
async function exportToExcel() {
  try {
    const response = await fetch('/api/export/requests?status=Completed');
    
    if (!response.ok) {
      // Try to get error message from JSON response
      const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(errorData.error || 'Export failed');
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Export failed');
    }
    
    // Get the blob from response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Set filename
    const date = new Date().toISOString().split('T')[0];
    a.download = `Al_Huda_Completed_Tasks_${date}.xlsx`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showAlert('Excel file downloaded successfully!', 'success');
    
  } catch (error) {
    console.error('Export error:', error);
    showAlert(error.message || 'Failed to export data. Please try again.', 'error');
  }
}

function showAlert(message, type) {
  // Simple alert for history page
  alert(message);
}

// Selection and Deletion Logic
function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const checkboxes = document.querySelectorAll('.request-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
  });
  
  toggleSelection();
}

function toggleSelection() {
  const checkboxes = document.querySelectorAll('.request-checkbox');
  const deleteBtn = document.getElementById('deleteSelectedBtn');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  
  let checkedCount = 0;
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) checkedCount++;
  });
  
  if (deleteBtn) {
    if (checkedCount > 0) {
      deleteBtn.style.display = 'inline-block';
      deleteBtn.textContent = 'Delete Selected (' + checkedCount + ')';
    } else {
      deleteBtn.style.display = 'none';
    }
  }
  
  if (selectAllCheckbox && checkboxes.length > 0) {
    selectAllCheckbox.checked = checkedCount === checkboxes.length;
  }
}

async function deleteSelectedRequests() {
  const checkboxes = document.querySelectorAll('.request-checkbox:checked');
  const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
  
  if (idsToDelete.length === 0) return;
  
  if (!confirm('Are you sure you want to permanently delete ' + idsToDelete.length + ' selected entries?')) {
    return;
  }
  
  try {
    const response = await fetch('/api/requests/delete-multiple', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: idsToDelete })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Remove from local array
      completedRequests = completedRequests.filter(r => !idsToDelete.includes(r.id));
      
      // Update UI
      if (typeof showAlert === 'function') {
        showAlert('Successfully deleted ' + data.deletedCount + ' request(s)', 'success');
      } else {
        alert('Successfully deleted ' + data.deletedCount + ' request(s)');
      }
      
      // Update stats and re-filter
      updateStats(completedRequests);
      displayHistory(completedRequests);
    } else {
      if (typeof showAlert === 'function') {
        showAlert(data.error || 'Failed to delete requests', 'error');
      } else {
        alert(data.error || 'Failed to delete requests');
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    if (typeof showAlert === 'function') {
      showAlert('An error occurred while deleting requests', 'error');
    } else {
      alert('An error occurred while deleting requests');
    }
  }
}
