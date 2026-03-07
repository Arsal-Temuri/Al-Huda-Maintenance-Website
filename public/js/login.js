// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const alertBox = document.getElementById('alertBox');
  const submitButton = e.target.querySelector('button[type="submit"]');
  
  submitButton.disabled = true;
  submitButton.textContent = 'Logging in...';
  
  try {
    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password')
    };
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } else {
      showAlert(data.error || 'Invalid credentials', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error. Please try again.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
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
