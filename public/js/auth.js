// ============================================
// LUMORA BOOKS - CLIENT AUTHENTICATION HANDLER
// ============================================

// Check authentication status and update Navbar
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
});

// Update auth indicators in desktop navbar and mobile menu
async function updateNavbarAuth() {
  const container = document.getElementById('navAuthContainer');
  const mobileLink = document.getElementById('mobileAuthLink');
  const token = localStorage.getItem('lumoraToken');

  if (!token) {
    // Show standard login icon link
    if (container) {
      container.innerHTML = `
        <a href="/login.html" class="nav-icon-btn" aria-label="Login/Register" id="authBtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      `;
    }
    if (mobileLink) {
      mobileLink.innerHTML = `<a href="/login.html" class="mobile-menu-link">Login / Register</a>`;
    }
    return;
  }

  // Attempt to fetch profile info
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      
      // Update desktop navbar with user dropdown menu
      if (container) {
        container.innerHTML = `
          <div class="nav-auth-container-active" style="position: relative;">
            <button class="nav-icon-btn" aria-label="User Account" id="userMenuBtn" style="display: flex; align-items: center; gap: 4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <div class="user-profile-menu" id="userProfileMenu">
              <div class="user-profile-info">
                <p class="user-profile-name">${user.name}</p>
                <p class="user-profile-email">${user.email}</p>
              </div>
              <div class="user-profile-links">
                <a href="/wishlist.html">My Wishlist</a>
                <a href="/cart.html">My Cart</a>
              </div>
              <div class="user-profile-logout">
                <button class="user-profile-logout-btn" onclick="logoutUser()">Logout</button>
              </div>
            </div>
          </div>
        `;
        
        // Add toggle behavior for user menu
        const menuBtn = document.getElementById('userMenuBtn');
        const menu = document.getElementById('userProfileMenu');
        if (menuBtn && menu) {
          menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.style.visibility = menu.style.visibility === 'visible' ? 'hidden' : 'visible';
            menu.style.opacity = menu.style.opacity === '1' ? '0' : '1';
          });
          
          document.addEventListener('click', () => {
            menu.style.visibility = 'hidden';
            menu.style.opacity = '0';
          });
        }
      }

      // Update mobile link
      if (mobileLink) {
        mobileLink.innerHTML = `
          <div style="padding: 10px 0;">
            <p style="font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; color: var(--burgundy);">Hello, ${user.name}</p>
            <a href="#" class="mobile-menu-link" onclick="logoutUser()" style="color: var(--burgundy); font-weight: 500;">Logout</a>
          </div>
        `;
      }

    } else {
      // Token is invalid/expired
      localStorage.removeItem('lumoraToken');
      updateNavbarAuth();
    }
  } catch (error) {
    console.error('Fetch profile error:', error);
    // Fallback: show plain login link if server is down
  }
}

// Log out action
function logoutUser() {
  localStorage.removeItem('lumoraToken');
  window.location.href = '/';
}

window.logoutUser = logoutUser;

// Dynamic Login/Register Modal Popup
function showLoginModal(defaultTab = 'login') {
  let modalOverlay = document.getElementById('loginModalOverlay');
  
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'loginModalOverlay';
    modalOverlay.className = 'login-modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  // Render content
  renderModalContent(modalOverlay, defaultTab);
  
  // Show modal
  setTimeout(() => {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 10);
}

function renderModalContent(modalOverlay, mode) {
  if (mode === 'login') {
    modalOverlay.innerHTML = `
      <div class="login-modal-card">
        <button class="login-modal-close" id="loginModalCloseBtn">&times;</button>
        <h2 class="login-modal-logo">LUMORA</h2>
        <p class="login-modal-subtitle">Sign in to continue your reading journey</p>
        
        <div class="login-modal-main-error" id="modalMainError"></div>

        <form id="modalLoginForm">
          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalEmail">Email Address</label>
            <input type="email" id="modalEmail" class="login-modal-input" required placeholder="name@example.com">
            <div class="login-modal-error-msg" id="modalEmailError"></div>
          </div>
          
          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalPassword">Password</label>
            <input type="password" id="modalPassword" class="login-modal-input" required placeholder="••••••••">
            <button type="button" class="login-modal-password-toggle" id="modalPasswordToggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="modalEyeIcon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <div class="login-modal-error-msg" id="modalPasswordError"></div>
          </div>

          <button type="submit" class="login-modal-btn" id="modalSubmitBtn">SIGN IN</button>
        </form>

        <p class="login-modal-switch-text">
          Don't have an account? 
          <span class="login-modal-switch-link" id="switchToRegister">Create Account</span>
        </p>
      </div>
    `;
    setupLoginFormEvents(modalOverlay);
  } else {
    modalOverlay.innerHTML = `
      <div class="login-modal-card">
        <button class="login-modal-close" id="loginModalCloseBtn">&times;</button>
        <h2 class="login-modal-logo">LUMORA</h2>
        <p class="login-modal-subtitle">Create an account to save your library</p>
        
        <div class="login-modal-main-error" id="modalMainError"></div>

        <form id="modalRegisterForm">
          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalRegName">Full Name</label>
            <input type="text" id="modalRegName" class="login-modal-input" required placeholder="John Doe">
            <div class="login-modal-error-msg" id="modalRegNameError"></div>
          </div>

          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalRegEmail">Email Address</label>
            <input type="email" id="modalRegEmail" class="login-modal-input" required placeholder="name@example.com">
            <div class="login-modal-error-msg" id="modalRegEmailError"></div>
          </div>
          
          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalRegPassword">Password (min 6 chars)</label>
            <input type="password" id="modalRegPassword" class="login-modal-input" required placeholder="••••••••">
            <button type="button" class="login-modal-password-toggle" id="modalRegPasswordToggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <div class="login-modal-error-msg" id="modalRegPasswordError"></div>
          </div>

          <div class="login-modal-form-group">
            <label class="login-modal-label" for="modalRegConfirm">Confirm Password</label>
            <input type="password" id="modalRegConfirm" class="login-modal-input" required placeholder="••••••••">
            <button type="button" class="login-modal-password-toggle" id="modalRegConfirmToggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <div class="login-modal-error-msg" id="modalRegConfirmError"></div>
          </div>

          <button type="submit" class="login-modal-btn" id="modalSubmitBtn">CREATE ACCOUNT</button>
        </form>

        <p class="login-modal-switch-text">
          Already have an account? 
          <span class="login-modal-switch-link" id="switchToLogin">Sign In</span>
        </p>
      </div>
    `;
    setupRegisterFormEvents(modalOverlay);
  }

  // Common close events
  const closeBtn = document.getElementById('loginModalCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLoginModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeLoginModal();
    }
  });
}

function closeLoginModal() {
  const modalOverlay = document.getElementById('loginModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setupLoginFormEvents(modalOverlay) {
  const form = document.getElementById('modalLoginForm');
  const emailInput = document.getElementById('modalEmail');
  const passwordInput = document.getElementById('modalPassword');
  
  const emailError = document.getElementById('modalEmailError');
  const passwordError = document.getElementById('modalPasswordError');
  const mainError = document.getElementById('modalMainError');
  const submitBtn = document.getElementById('modalSubmitBtn');
  const passToggle = document.getElementById('modalPasswordToggle');
  const switchLink = document.getElementById('switchToRegister');

  if (passToggle && passwordInput) {
    passToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passToggle.innerHTML = type === 'password' ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ` : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    });
  }

  if (switchLink) {
    switchLink.addEventListener('click', () => {
      renderModalContent(modalOverlay, 'register');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      emailError.textContent = '';
      passwordError.textContent = '';
      mainError.style.display = 'none';

      let isValid = true;
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Email is required';
        isValid = false;
      }
      if (!passwordInput.value.trim()) {
        passwordError.textContent = 'Password is required';
        isValid = false;
      }

      if (!isValid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'LOGGING IN...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value.trim(),
            password: passwordInput.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('lumoraToken', data.token);
          closeLoginModal();
          window.location.reload();
        } else {
          mainError.textContent = data.message || 'Login failed';
          mainError.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'SIGN IN';
        }
      } catch (err) {
        console.error(err);
        mainError.textContent = 'Connection error. Please try again.';
        mainError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'SIGN IN';
      }
    });
  }
}

function setupRegisterFormEvents(modalOverlay) {
  const form = document.getElementById('modalRegisterForm');
  const nameInput = document.getElementById('modalRegName');
  const emailInput = document.getElementById('modalRegEmail');
  const passwordInput = document.getElementById('modalRegPassword');
  const confirmInput = document.getElementById('modalRegConfirm');

  const nameError = document.getElementById('modalRegNameError');
  const emailError = document.getElementById('modalRegEmailError');
  const passwordError = document.getElementById('modalRegPasswordError');
  const confirmError = document.getElementById('modalRegConfirmError');
  const mainError = document.getElementById('modalMainError');
  const submitBtn = document.getElementById('modalSubmitBtn');
  const switchLink = document.getElementById('switchToLogin');

  const passToggle = document.getElementById('modalRegPasswordToggle');
  const confirmToggle = document.getElementById('modalRegConfirmToggle');

  if (passToggle && passwordInput) {
    passToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passToggle.innerHTML = type === 'password' ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ` : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    });
  }

  if (confirmToggle && confirmInput) {
    confirmToggle.addEventListener('click', () => {
      const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmInput.setAttribute('type', type);
      confirmToggle.innerHTML = type === 'password' ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ` : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    });
  }

  if (switchLink) {
    switchLink.addEventListener('click', () => {
      renderModalContent(modalOverlay, 'login');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      nameError.textContent = '';
      emailError.textContent = '';
      passwordError.textContent = '';
      confirmError.textContent = '';
      mainError.style.display = 'none';

      let isValid = true;

      if (!nameInput.value.trim()) {
        nameError.textContent = 'Name is required';
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address';
        isValid = false;
      }

      if (!passwordInput.value) {
        passwordError.textContent = 'Password is required';
        isValid = false;
      } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long';
        isValid = false;
      }

      if (!confirmInput.value) {
        confirmError.textContent = 'Confirm password is required';
        isValid = false;
      } else if (passwordInput.value !== confirmInput.value) {
        confirmError.textContent = 'Passwords do not match';
        isValid = false;
      }

      if (!isValid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'CREATING ACCOUNT...';

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('lumoraToken', data.token);
          closeLoginModal();
          window.location.reload();
        } else {
          mainError.textContent = data.message || 'Registration failed';
          mainError.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'CREATE ACCOUNT';
        }
      } catch (err) {
        console.error(err);
        mainError.textContent = 'Connection error. Please try again.';
        mainError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'CREATE ACCOUNT';
      }
    });
  }
}

window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
