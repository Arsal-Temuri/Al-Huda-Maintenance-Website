let currentUser = null;
let allRequests = [];
let allWorkers = [];
let currentFilter = 'all';

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadWorkers();
  await loadRequests();
  
  // Set up verify form event listener
  const verifyForm = document.getElementById('verifyForm');
  if (verifyForm) {
    verifyForm.addEventListener('submit', handleVerifyFormSubmit);
  }
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

async function loadWorkers() {
  try {
    const response = await fetch('/api/workers');
    const data = await response.json();
    allWorkers = data.workers;
    
    // Populate worker dropdown
    const workerSelect = document.getElementById('workerId');
    workerSelect.innerHTML = '<option value="">-- Select Worker --</option>';
    
    allWorkers.forEach(worker => {
      const option = document.createElement('option');
      option.value = worker.id;
      option.textContent = `${worker.name} (${worker.role})`;
      workerSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load workers:', error);
  }
}

async function loadRequests() {
  try {
    const response = await fetch('/api/requests');
    const data = await response.json();
    allRequests = data.requests;
    
    updateStats();
    displayRequests(allRequests);
  } catch (error) {
    console.error('Failed to load requests:', error);
    showAlert('Failed to load requests', 'error');
  }
}

function updateStats() {
  const total = allRequests.length;
  const pending = allRequests.filter(r => r.status === 'Pending').length;
  const inProgress = allRequests.filter(r => r.status === 'Verified' || r.status === 'Assigned').length;
  const completed = allRequests.filter(r => r.status === 'Completed').length;
  
  document.getElementById('totalRequests').textContent = total;
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('inProgressCount').textContent = inProgress;
  document.getElementById('completedCount').textContent = completed;
}

function filterRequests(status) {
  currentFilter = status;
  
  // Update button active state
  document.querySelectorAll('#filterTabs .btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  if (status === 'all') {
    displayRequests(allRequests);
  } else {
    const filtered = allRequests.filter(r => r.status === status);
    displayRequests(filtered);
  }
}

function displayRequests(requests) {
  const tbody = document.getElementById('requestsTableBody');
  
  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No requests found</td></tr>';
    return;
  }
  
  // Sort by submission date (newest first)
  requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
  tbody.innerHTML = requests.map(request => {
    const actions = getActionButtons(request);
    const workerInfo = request.assignedWorker 
      ? `${request.assignedWorker.name} (${request.assignedWorker.role})`
      : '-';
    
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
        <td data-label="Status"><span class="badge badge-${request.status.toLowerCase()}">${request.status}</span></td>
        <td data-label="Worker">${workerInfo}</td>
        <td data-label="Submitted">${formatDate(request.submittedAt)}</td>
        <td data-label="Actions">
          <div class="action-buttons">
            ${actions}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  // Reset select all checkbox and delete button state
  document.getElementById('selectAllCheckbox').checked = false;
  toggleSelection();
}

function getActionButtons(request) {
  const buttons = [];
  
  // Verify button (for female admin on pending requests)
  if (request.status === 'Pending' && currentUser.role === 'female_admin') {
    buttons.push(`<button class="btn btn-success btn-sm" onclick="verifyRequest('${request.id}')">Verify</button>`);
  }
  
  // Assign button (for male admin on verified requests)
  if (request.status === 'Verified' && currentUser.role === 'male_admin') {
    buttons.push(`<button class="btn btn-warning btn-sm" onclick="openAssignModal('${request.id}')">Assign Worker</button>`);
  }
  
  // Complete button (for male admin on assigned requests)
  if (request.status === 'Assigned' && currentUser.role === 'male_admin') {
    buttons.push(`<button class="btn btn-success btn-sm" onclick="completeRequest('${request.id}')">Complete</button>`);
  }
  
  return buttons.length > 0 ? buttons.join('') : '<span style="color: #a0aec0;">-</span>';
}

async function verifyRequest(requestId) {
  // Find the request details
  const request = allRequests.find(r => r.id === requestId);
  if (!request) return;
  
  // Populate modal
  document.getElementById('verifyRequestId').value = requestId;
  document.getElementById('verifyRequestDetails').innerHTML = `
    <strong>Request ID:</strong> ${request.id}<br>
    <strong>Department:</strong> ${request.department}<br>
    <strong>Type:</strong> ${request.requestType}<br>
    <strong>Description:</strong> ${request.description}<br>
    <strong>Current Priority:</strong> ${request.priority}<br>
    <strong>Submitted:</strong> ${formatDate(request.submittedAt)}
  `;
  
  // Show modal
  document.getElementById('verifyModal').style.display = 'flex';
}

function closeVerifyModal() {
  document.getElementById('verifyModal').style.display = 'none';
  document.getElementById('verifyForm').reset();
}

async function handleVerifyFormSubmit(e) {
  e.preventDefault();
  
  const requestId = document.getElementById('verifyRequestId').value;
  const priority = document.getElementById('verifyPriority').value;
  
  try {
    const response = await fetch(`/api/requests/${requestId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priority })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      closeVerifyModal();
      showAlert('Request verified successfully with priority: ' + priority, 'success');
      await loadRequests();
    } else {
      showAlert(data.error || 'Failed to verify request', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error', 'error');
  }
}

function openAssignModal(requestId) {
  const request = allRequests.find(r => r.id === requestId);
  if (!request) return;
  
  document.getElementById('assignRequestId').value = requestId;
  document.getElementById('assignRequestDetails').innerHTML = `
    <p><strong>Request ID:</strong> ${request.id}</p>
    <p><strong>Department:</strong> ${request.department}</p>
    <p><strong>Type:</strong> ${request.requestType}</p>
    <p><strong>Priority:</strong> <span class="badge badge-${request.priority.toLowerCase()}">${request.priority}</span></p>
    <p><strong>Description:</strong> ${request.description}</p>
  `;
  
  document.getElementById('assignModal').classList.add('show');
}

function closeAssignModal() {
  document.getElementById('assignModal').classList.remove('show');
  document.getElementById('assignForm').reset();
}

document.getElementById('assignForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const requestId = document.getElementById('assignRequestId').value;
  const workerId = document.getElementById('workerId').value;
  
  try {
    const response = await fetch(`/api/requests/${requestId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workerId })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      closeAssignModal();
      showAlert('Worker assigned successfully', 'success');
      await loadRequests();
      
      // Show WhatsApp message modal
      showWhatsAppMessage(data.request, data.worker);
    } else {
      showAlert(data.error || 'Failed to assign worker', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error', 'error');
  }
});

function showWhatsAppMessage(request, worker) {
  const message = `السلام علیکم ${worker.name},

New maintenance task assigned:

Request ID: ${request.id}
Department: ${request.department}
Type: ${request.requestType}
Priority: ${request.priority}
Details: ${request.description}

Please collect the slip from admin office and complete the work.

JazakAllah Khair
Al Huda Administration`;

  document.getElementById('whatsappMessage').textContent = message;
  document.getElementById('workerPhone').textContent = worker.phone;
  document.getElementById('whatsappModal').classList.add('show');
}

function closeWhatsAppModal() {
  document.getElementById('whatsappModal').classList.remove('show');
}

async function completeRequest(requestId) {
  if (!confirm('Mark this request as completed?')) return;
  
  try {
    const response = await fetch(`/api/requests/${requestId}/complete`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Request marked as completed', 'success');
      await loadRequests();
    } else {
      showAlert(data.error || 'Failed to complete request', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error', 'error');
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.className = `alert alert-${type} show`;
  alertBox.textContent = message;
  
  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 5000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Export to Excel function
async function exportToExcel() {
  try {
    const response = await fetch(`/api/export/requests?status=${currentFilter}`);
    
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
    const status = currentFilter === 'all' ? 'All' : currentFilter;
    const date = new Date().toISOString().split('T')[0];
    a.download = `Al_Huda_Requests_${status}_${date}.xlsx`;
    
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
      allRequests = allRequests.filter(r => !idsToDelete.includes(r.id));
      
      // Update UI
      if (typeof showAlert === 'function') {
        showAlert('Successfully deleted ' + data.deletedCount + ' request(s)', 'success');
      } else {
        alert('Successfully deleted ' + data.deletedCount + ' request(s)');
      }
      
      // Update stats and re-filter
      updateStats();
      filterRequests(currentFilter);
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
