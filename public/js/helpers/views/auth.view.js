import { api } from '../../api.js';
import { showToast } from '../../ui.js';
import { validateEmail, validatePseudo, validatePassword } from '../validators.js';

let currentView = 'login'; // 'login' or 'register'

export async function renderAuthView() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="container" style="max-width: 400px; margin: 2rem auto;">
      <div class="card animate-in">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="margin-bottom: 0.5rem;">MORNING STARS</h1>
          <p style="color: var(--text-secondary);">Partagez vos moments</p>
        </div>

        <div id="auth-forms">
          ${renderLoginForm()}
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--bg-input);">
          <p style="text-align: center; color: var(--text-secondary);">
            ${currentView === 'login' 
              ? 'Pas de compte ?' 
              : 'Déjà un compte ?'
            }
            <a href="#" id="switch-auth-view" style="color: var(--neon-primary);">
              ${currentView === 'login' ? 'Créer un compte' : 'Se connecter'}
            </a>
          </p>
        </div>
      </div>
    </div>
  `;

  setupAuthEventListeners();
}

function renderLoginForm() {
  return `
    <form id="login-form">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" name="email" required>
        <div class="form-error" id="email-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Mot de passe</label>
        <input type="password" class="form-input" name="password" required>
        <div class="form-error" id="password-error"></div>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%;">
        Se connecter
      </button>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="register-form">
      <div class="form-group">
        <label class="form-label">Pseudo</label>
        <input type="text" class="form-input" name="pseudo" required maxlength="20">
        <div class="form-error" id="pseudo-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" name="email" required>
        <div class="form-error" id="email-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Mot de passe</label>
        <input type="password" class="form-input" name="password" required minlength="6">
        <div class="form-error" id="password-error"></div>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%;">
        Créer un compte
      </button>
    </form>
  `;
}

function setupAuthEventListeners() {
  // Switch between login and register
  document.getElementById('switch-auth-view').addEventListener('click', (e) => {
    e.preventDefault();
    currentView = currentView === 'login' ? 'register' : 'login';
    
    const authForms = document.getElementById('auth-forms');
    authForms.innerHTML = currentView === 'login' ? renderLoginForm() : renderRegisterForm();
    setupAuthEventListeners();
  });

  // Form submissions
  if (currentView === 'login') {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
  } else {
    document.getElementById('register-form').addEventListener('submit', handleRegister);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Validate
  const emailError = validateEmail(data.email);
  const passwordError = validatePassword(data.password);

  document.getElementById('email-error').textContent = emailError || '';
  document.getElementById('password-error').textContent = passwordError || '';

  if (emailError || passwordError) return;

  try {
    const result = await api.auth.login(data);
    
    // Update state and redirect
    window.state.setState({
      user: result.user,
      token: result.token
    });
    
    showToast('Connexion réussie!', 'success');
    window.location.hash = '#/feed';
    
  } catch (error) {
    showToast(error.message || 'Erreur de connexion', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Validate
  const pseudoError = validatePseudo(data.pseudo);
  const emailError = validateEmail(data.email);
  const passwordError = validatePassword(data.password);

  document.getElementById('pseudo-error').textContent = pseudoError || '';
  document.getElementById('email-error').textContent = emailError || '';
  document.getElementById('password-error').textContent = passwordError || '';

  if (pseudoError || emailError || passwordError) return;

  try {
    await api.auth.register(data);
    
    showToast('Compte créé avec succès! Veuillez vous connecter.', 'success');
    
    // Switch to login form after successful registration
    currentView = 'login';
    const authForms = document.getElementById('auth-forms');
    authForms.innerHTML = renderLoginForm();
    setupAuthEventListeners();
    
  } catch (error) {
    showToast(error.message || 'Erreur lors de la création du compte', 'error');
  }
}
