// ====================================
// HEXSTORE - INDUSTRIAL QUALITY AUTHENTICATION MODULE
// Features: Email/Password, OAuth (Google/Microsoft), Validation, Session Management
// ====================================

const AUTH_STORAGE_KEY = 'hs_auth';
const USERS_STORAGE_KEY = 'hs_users';

// Auth State
let authState = {
  currentUser: JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null'),
  users: JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
};

// ====================================
// TOAST NOTIFICATION SYSTEM
// ====================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.getElementById('app').appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ====================================
// VALIDATION FUNCTIONS
// ====================================
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  // Industrial strength: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    valid: hasMinLength && hasUppercase && hasLowercase && hasNumber,
    checks: {
      minLength: hasMinLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      specialChar: hasSpecialChar
    }
  };
}

function validateUsername(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// ====================================
// PASSWORD STRENGTH INDICATOR
// ====================================
function getPasswordStrength(password) {
  const validation = validatePassword(password);
  const checks = validation.checks;
  let score = 0;
  
  if (checks.minLength) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.specialChar) score++;
  if (password.length >= 12) score++;
  
  return {
    score,
    percentage: Math.round((score / 6) * 100),
    level: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
    checks
  };
}

// ====================================
// USER REGISTRATION
// ====================================
function registerUser(userData) {
  const { email, password, username, userType, fullName } = userData;
  
  // Validation
  if (!validateEmail(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { 
      success: false, 
      error: 'Password does not meet requirements',
      passwordChecks: passwordValidation.checks
    };
  }
  
  if (!validateUsername(username)) {
    return { success: false, error: 'Username must be 3+ characters (letters, numbers, underscores)' };
  }
  
  // Check existing users
  if (authState.users.find(u => u.email === email)) {
    return { success: false, error: 'An account with this email already exists' };
  }
  
  if (authState.users.find(u => u.username === username)) {
    return { success: false, error: 'This username is already taken' };
  }
  
  // Create new user
  const newUser = {
    id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    email,
    username,
    fullName: fullName || username,
    userType: userType || 'buyer',
    passwordHash: btoa(password + ':hexstore'), // Simple encoding (use bcrypt in production)
    createdAt: new Date().toISOString(),
    avatar: null,
    provider: 'email',
    verified: false,
    settings: {
      notifications: true,
      newsletter: false,
      twoFactor: false
    }
  };
  
  authState.users.push(newUser);
  saveUsers();
  
  // Auto-login
  loginUser(email, password);
  
  return { success: true, user: { ...newUser, passwordHash: undefined } };
}

// ====================================
// USER LOGIN
// ====================================
function loginUser(email, password) {
  const user = authState.users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, error: 'No account found with this email' };
  }
  
  if (user.provider !== 'email') {
    return { success: false, error: `Please sign in using ${user.provider}` };
  }
  
  if (btoa(password + ':hexstore') !== user.passwordHash) {
    return { success: false, error: 'Incorrect password' };
  }
  
  authState.currentUser = { ...user, passwordHash: undefined };
  saveAuthState();
  
  return { success: true, user: authState.currentUser };
}

// ====================================
// OAUTH LOGIN (Simulated for Demo)
// ====================================
function handleOAuthLogin(provider) {
  // In production, this would redirect to OAuth provider
  // For demo, we simulate a successful OAuth flow
  
  const mockEmail = `user_${Date.now().toString(36)}@${provider}.demo`;
  const mockUsername = `${provider}_user_${Math.random().toString(36).substr(2, 5)}`;
  
  const oauthUser = {
    id: 'user_' + Date.now().toString(36),
    email: mockEmail,
    username: mockUsername,
    fullName: 'OAuth User',
    userType: 'buyer',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('OAuth User')}&background=random&size=128`,
    provider: provider,
    verified: true,
    createdAt: new Date().toISOString(),
    settings: {
      notifications: true,
      newsletter: false,
      twoFactor: false
    }
  };
  
  // Check if user exists
  let existingUser = authState.users.find(u => u.provider === provider && u.email === mockEmail);
  
  if (!existingUser) {
    authState.users.push(oauthUser);
    saveUsers();
    existingUser = oauthUser;
  }
  
  authState.currentUser = existingUser;
  saveAuthState();
  
  return { success: true, user: authState.currentUser };
}

// ====================================
// LOGOUT
// ====================================
function logoutUser() {
  authState.currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  
  // Close modals
  document.querySelectorAll('.auth-modal, .modal-overlay, .user-dropdown-menu').forEach(el => {
    el.classList.add('hidden');
    if (el.classList.contains('user-dropdown-menu')) el.remove();
  });
  
  updateUIForAuthState();
  showToast('You have been logged out successfully', 'info');
}

// ====================================
// STORAGE FUNCTIONS
// ====================================
function saveAuthState() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState.currentUser));
}

function saveUsers() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(authState.users));
}

// ====================================
// AUTH STATE CHECKS
// ====================================
function isLoggedIn() {
  return authState.currentUser !== null;
}

function getCurrentUser() {
  return authState.currentUser;
}

function isSeller() {
  return authState.currentUser?.userType === 'seller';
}

function isBuyer() {
  return authState.currentUser?.userType === 'buyer';
}

// ====================================
// UI UPDATE FUNCTIONS
// ====================================
function updateUIForAuthState() {
  const authButtons = document.getElementById('auth-buttons');
  const userMenuGroup = document.getElementById('user-menu-group');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  
  if (!authButtons || !userMenuGroup) return;
  
  if (isLoggedIn()) {
    const user = getCurrentUser();
    
    // Hide auth buttons, show user menu
    authButtons.classList.add('hidden');
    userMenuGroup.classList.remove('hidden');
    
    // Update user info
    userAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0f6fff&color=fff&size=128`;
    userName.textContent = user.username;
  } else {
    // Show auth buttons, hide user menu
    authButtons.classList.remove('hidden');
    userMenuGroup.classList.add('hidden');
  }
}

// ====================================
// CREATE AUTH MODAL (Industrial Quality)
// ====================================
function createAuthModal(defaultTab = 'login') {
  if (document.getElementById('auth-modal')) return;
  
  const modalHTML = `
    <div id="auth-modal-overlay" class="modal-overlay">
      <div id="auth-modal" class="auth-modal" role="dialog" aria-labelledby="auth-modal-title">
        <button class="modal-close" id="close-auth-modal" aria-label="Close modal">
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Modal Header -->
        <div class="auth-modal-header">
          <div class="auth-logo">
            <i class="fas fa-cube"></i>
            <span>HexStore</span>
          </div>
        </div>
        
        <!-- Tab Navigation -->
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab ${defaultTab === 'login' ? 'active' : ''}" data-tab="login" role="tab" aria-selected="${defaultTab === 'login'}">
            <i class="fas fa-sign-in-alt"></i> Sign In
          </button>
          <button class="auth-tab ${defaultTab === 'register' ? 'active' : ''}" data-tab="register" role="tab" aria-selected="${defaultTab === 'register'}">
            <i class="fas fa-user-plus"></i> Create Account
          </button>
        </div>
        
        <!-- Login Form -->
        <div id="login-form" class="auth-form ${defaultTab === 'login' ? '' : 'hidden'}">
          <h2 id="auth-modal-title">Welcome Back</h2>
          <p class="auth-subtitle">Sign in to access your account and continue shopping</p>
          
          <form id="login-form-element" novalidate>
            <div class="form-group">
              <label for="login-email">
                <i class="fas fa-envelope"></i> Email Address
              </label>
              <div class="input-icon">
                <i class="fas fa-envelope"></i>
                <input 
                  type="email" 
                  id="login-email" 
                  name="email"
                  placeholder="Enter your email address" 
                  required 
                  autocomplete="email"
                  aria-required="true"
                >
              </div>
              <span class="form-error" id="login-email-error"></span>
            </div>
            
            <div class="form-group">
              <label for="login-password">
                <i class="fas fa-lock"></i> Password
              </label>
              <div class="input-icon input-icon-toggle">
                <i class="fas fa-lock"></i>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password"
                  placeholder="Enter your password" 
                  required 
                  autocomplete="current-password"
                  aria-required="true"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <span class="form-error" id="login-password-error"></span>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" id="remember-me" name="remember">
                <span class="checkmark"></span>
                <span>Remember me for 30 days</span>
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            
            <button type="submit" class="auth-submit-btn">
              <i class="fas fa-sign-in-alt"></i> Sign In Securely
            </button>
          </form>
          
          <div class="auth-divider">
            <span>or continue with</span>
          </div>
          
          <div class="oauth-buttons">
            <button class="oauth-btn google-btn" data-provider="google">
              <i class="fab fa-google"></i>
              <span>Google</span>
            </button>
            <button class="oauth-btn microsoft-btn" data-provider="microsoft">
              <i class="fab fa-microsoft"></i>
              <span>Microsoft</span>
            </button>
          </div>
          
          <p class="auth-footer-text">
            Don't have an account? 
            <a href="#" class="switch-tab" data-tab="register">Create one now</a>
          </p>
        </div>
        
        <!-- Registration Form -->
        <div id="register-form" class="auth-form ${defaultTab === 'register' ? '' : 'hidden'}">
          <h2 id="auth-modal-title">Create Your Account</h2>
          <p class="auth-subtitle">Join HexStore and start shopping or selling today</p>
          
          <form id="register-form-element" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="register-username">
                  <i class="fas fa-user"></i> Username
                </label>
                <div class="input-icon">
                  <i class="fas fa-user"></i>
                  <input 
                    type="text" 
                    id="register-username" 
                    name="username"
                    placeholder="Choose a username" 
                    required 
                    minlength="3"
                    pattern="[a-zA-Z0-9_]+"
                    autocomplete="username"
                    aria-required="true"
                  >
                </div>
                <small class="form-hint">3+ characters, letters, numbers, underscores</small>
                <span class="form-error" id="register-username-error"></span>
              </div>
              
              <div class="form-group">
                <label for="register-fullname">
                  <i class="fas fa-user-circle"></i> Full Name
                </label>
                <div class="input-icon">
                  <i class="fas fa-user-circle"></i>
                  <input 
                    type="text" 
                    id="register-fullname" 
                    name="fullName"
                    placeholder="Your full name" 
                    required 
                    autocomplete="name"
                    aria-required="true"
                  >
                </div>
                <span class="form-error" id="register-fullname-error"></span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="register-email">
                <i class="fas fa-envelope"></i> Email Address
              </label>
              <div class="input-icon">
                <i class="fas fa-envelope"></i>
                <input 
                  type="email" 
                  id="register-email" 
                  name="email"
                  placeholder="Enter your email address" 
                  required 
                  autocomplete="email"
                  aria-required="true"
                >
              </div>
              <span class="form-error" id="register-email-error"></span>
            </div>
            
            <div class="form-group">
              <label for="register-password">
                <i class="fas fa-lock"></i> Password
              </label>
              <div class="input-icon input-icon-toggle">
                <i class="fas fa-lock"></i>
                <input 
                  type="password" 
                  id="register-password" 
                  name="password"
                  placeholder="Create a strong password" 
                  required 
                  minlength="8"
                  autocomplete="new-password"
                  aria-required="true"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div class="password-strength" id="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" id="strength-fill"></div>
                </div>
                <div class="strength-text">
                  <span id="strength-label">Password strength</span>
                </div>
                <div class="password-checks" id="password-checks">
                  <div class="check-item" data-check="minLength">
                    <i class="fas fa-circle"></i>
                    <span>8+ characters</span>
                  </div>
                  <div class="check-item" data-check="uppercase">
                    <i class="fas fa-circle"></i>
                    <span>Uppercase letter</span>
                  </div>
                  <div class="check-item" data-check="lowercase">
                    <i class="fas fa-circle"></i>
                    <span>Lowercase letter</span>
                  </div>
                  <div class="check-item" data-check="number">
                    <i class="fas fa-circle"></i>
                    <span>Number</span>
                  </div>
                </div>
              </div>
              <span class="form-error" id="register-password-error"></span>
            </div>
            
            <div class="form-group">
              <label for="register-confirm-password">
                <i class="fas fa-lock"></i> Confirm Password
              </label>
              <div class="input-icon input-icon-toggle">
                <i class="fas fa-lock"></i>
                <input 
                  type="password" 
                  id="register-confirm-password" 
                  name="confirmPassword"
                  placeholder="Confirm your password" 
                  required 
                  autocomplete="new-password"
                  aria-required="true"
                >
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <span class="form-error" id="register-confirm-password-error"></span>
            </div>
            
            <div class="form-group">
              <label><i class="fas fa-user-tag"></i> Account Type</label>
              <div class="user-type-selector">
                <label class="user-type-option active">
                  <input type="radio" name="userType" value="buyer" checked>
                  <div class="user-type-card">
                    <div class="user-type-icon">
                      <i class="fas fa-shopping-bag"></i>
                    </div>
                    <span>Buyer</span>
                    <small>Shop & purchase products</small>
                  </div>
                </label>
                <label class="user-type-option">
                  <input type="radio" name="userType" value="seller">
                  <div class="user-type-card">
                    <div class="user-type-icon">
                      <i class="fas fa-store"></i>
                    </div>
                    <span>Seller</span>
                    <small>Sell your products</small>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" id="agree-terms" name="terms" required>
                <span class="checkmark"></span>
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>
            
            <button type="submit" class="auth-submit-btn">
              <i class="fas fa-user-plus"></i> Create My Account
            </button>
          </form>
          
          <div class="auth-divider">
            <span>or sign up with</span>
          </div>
          
          <div class="oauth-buttons">
            <button class="oauth-btn google-btn" data-provider="google">
              <i class="fab fa-google"></i>
              <span>Google</span>
            </button>
            <button class="oauth-btn microsoft-btn" data-provider="microsoft">
              <i class="fab fa-microsoft"></i>
              <span>Microsoft</span>
            </button>
          </div>
          
          <p class="auth-footer-text">
            Already have an account? 
            <a href="#" class="switch-tab" data-tab="login">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('app').insertAdjacentHTML('beforeend', modalHTML);
  bindAuthEvents();
}

// ====================================
// BIND AUTH EVENTS
// ====================================
function bindAuthEvents() {
  // Sign In button
  document.getElementById('signin-btn')?.addEventListener('click', () => {
    createAuthModal('login');
  });
  
  // Register button
  document.getElementById('register-btn')?.addEventListener('click', () => {
    createAuthModal('register');
  });
  
  // Close modal
  document.getElementById('close-auth-modal')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAuthModal();
  });
  
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });
  
  document.querySelectorAll('.switch-tab').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab(link.dataset.tab);
    });
  });
  
  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });
  
  // Password strength indicator
  document.getElementById('register-password')?.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });
  
  // User type selector
  document.querySelectorAll('.user-type-option input').forEach(option => {
    option.addEventListener('change', () => {
      document.querySelectorAll('.user-type-option').forEach(opt => {
        opt.classList.remove('active');
      });
      option.parentElement.classList.add('active');
    });
  });
  
  // Login form submission
  document.getElementById('login-form-element')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Clear previous errors
    clearFormErrors('login');
    
    // Validate
    let hasError = false;
    
    if (!validateEmail(email)) {
      showFieldError('login-email', 'login-email-error', 'Please enter a valid email address');
      hasError = true;
    }
    
    if (!password) {
      showFieldError('login-password', 'login-password-error', 'Password is required');
      hasError = true;
    }
    
    if (hasError) return;
    
    const result = loginUser(email, password);
    
    if (result.success) {
      closeAuthModal();
      updateUIForAuthState();
      showToast(`Welcome back, ${result.user.username}!`, 'success');
    } else {
      showFieldError('login-password', 'login-password-error', result.error);
    }
  });
  
  // Register form submission
  document.getElementById('register-form-element')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const fullName = document.getElementById('register-fullname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Clear previous errors
    clearFormErrors('register');
    
    // Validate
    let hasError = false;
    
    if (!validateUsername(username)) {
      showFieldError('register-username', 'register-username-error', 'Username must be 3+ characters (letters, numbers, underscores)');
      hasError = true;
    }
    
    if (!fullName) {
      showFieldError('register-fullname', 'register-fullname-error', 'Full name is required');
      hasError = true;
    }
    
    if (!validateEmail(email)) {
      showFieldError('register-email', 'register-email-error', 'Please enter a valid email address');
      hasError = true;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      showFieldError('register-password', 'register-password-error', 'Password does not meet requirements');
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      showFieldError('register-confirm-password', 'register-confirm-password-error', 'Passwords do not match');
      hasError = true;
    }
    
    if (!agreeTerms) {
      showToast('Please agree to the Terms of Service and Privacy Policy', 'warning');
      hasError = true;
    }
    
    if (hasError) return;
    
    const result = registerUser({ username, fullName, email, password, userType });
    
    if (result.success) {
      closeAuthModal();
      updateUIForAuthState();
      showToast(`Welcome to HexStore, ${result.user.username}! Your account has been created successfully.`, 'success');
    } else {
      showToast(result.error, 'error');
    }
  });
  
  // OAuth buttons
  document.querySelectorAll('.oauth-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.provider;
      const result = handleOAuthLogin(provider);
      
      if (result.success) {
        closeAuthModal();
        updateUIForAuthState();
        showToast(`Welcome, ${result.user.username}! You're now signed in with ${provider}.`, 'success');
      } else {
        showToast(result.error, 'error');
      }
    });
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('auth-modal-overlay');
      if (modal && !modal.classList.contains('hidden')) {
        closeAuthModal();
      }
    }
  });
}

// ====================================
// HELPER FUNCTIONS
// ====================================
function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });
  
  document.getElementById('login-form')?.classList.toggle('hidden', tabName !== 'login');
  document.getElementById('register-form')?.classList.toggle('hidden', tabName !== 'register');
}

function openAuthModal(tab = 'login') {
  createAuthModal(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal-overlay');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => modal.remove(), 300);
  }
}

function updatePasswordStrength(password) {
  const strength = getPasswordStrength(password);
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  
  if (!fill || !label) return;
  
  fill.style.width = strength.percentage + '%';
  fill.className = 'strength-fill level-' + strength.level;
  label.textContent = `Password strength: ${strength.level}`;
  label.className = 'strength-label level-' + strength.level;
  
  // Update check items
  document.querySelectorAll('.check-item').forEach(item => {
    const check = item.dataset.check;
    const icon = item.querySelector('i');
    
    if (strength.checks[check]) {
      icon.classList.replace('fa-circle', 'fa-check-circle');
      item.classList.add('passed');
    } else {
      icon.classList.replace('fa-check-circle', 'fa-circle');
      item.classList.remove('passed');
    }
  });
}

function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  
  if (input) {
    input.classList.add('error');
    input.parentElement.classList.add('has-error');
  }
  
  if (error) {
    error.textContent = message;
    error.classList.add('visible');
  }
}

function clearFormErrors(formType) {
  document.querySelectorAll(`#${formType}-form .form-error`).forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  
  document.querySelectorAll(`#${formType}-form input.error`).forEach(el => {
    el.classList.remove('error');
    el.parentElement?.classList.remove('has-error');
  });
}

// ====================================
// EXPORT API (ES Module)
// ====================================
export {
  registerUser as register,
  loginUser as login,
  logoutUser as logout,
  isLoggedIn,
  getCurrentUser,
  isSeller,
  isBuyer,
  openAuthModal,
  closeAuthModal,
  handleOAuthLogin,
  validateEmail,
  validatePassword,
  validateUsername,
  showToast
};

// Also expose globally for backward compatibility
window.HexAuth = {
  init: () => {
    updateUIForAuthState();
  },
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  isLoggedIn,
  getCurrentUser,
  isSeller,
  isBuyer,
  openAuthModal,
  closeAuthModal,
  handleOAuthLogin,
  showToast
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  HexAuth.init();
});
