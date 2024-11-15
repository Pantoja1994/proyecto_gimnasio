document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const submitButton = loginForm.querySelector('button[type="submit"]');
  
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      showError('Por favor, completa todos los campos.');
      resetButton();
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        window.location.href = '/dashboard.html';
      } else {
        const result = await response.json();
        showError(result.message || 'Error al iniciar sesión.');
        resetButton();
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al conectar con el servidor.');
      resetButton();
    }
  });

  function showError(message) {
    const errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
      const div = document.createElement('div');
      div.className = 'error-message alert alert-danger mt-3';
      div.textContent = message;
      loginForm.appendChild(div);
    } else {
      errorDiv.textContent = message;
    }
  }

  function resetButton() {
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
});
