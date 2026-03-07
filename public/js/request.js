// Request form submission
document.getElementById('requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const alertBox = document.getElementById('alertBox');
  const submitButton = e.target.querySelector('button[type="submit"]');
  
  // Disable submit button
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';
  
  try {
    const formData = new FormData(e.target);
    
    const response = await fetch('/api/requests', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Show success modal
      document.getElementById('requestIdDisplay').textContent = data.requestId;
      document.getElementById('successModal').classList.add('show');
    } else {
      showAlert(data.error || 'Failed to submit request', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Request';
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error. Please try again.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Request';
  }
});

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.className = `alert alert-${type} show`;
  alertBox.textContent = message;
  
  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 5000);
}

function closeModalAndReset() {
  document.getElementById('successModal').classList.remove('show');
  document.getElementById('requestForm').reset();
  document.querySelector('button[type="submit"]').disabled = false;
  document.querySelector('button[type="submit"]').textContent = 'Submit Request';
  window.scrollTo(0, 0);
}
