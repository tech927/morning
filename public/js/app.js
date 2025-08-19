import { state, setUser, logout } from './state.js';
import { showToast } from './ui.js';
import { renderAuthView } from './helpers/views/auth.view.js';
import { renderFeedView } from './helpers/views/feed.view.js';
import { renderUploadView } from './helpers/views/upload.view.js';
import { renderProfileView } from './helpers/views/profile.view.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  async handleRouteChange() {
    const hash = window.location.hash || '#/feed';
    const mainContent = document.getElementById('main-content');
    const loadingSpinner = document.getElementById('loading-spinner');
    const bottomNav = document.getElementById('bottom-nav');

    // Show loading
    loadingSpinner.style.display = 'flex';
    mainContent.innerHTML = '';

    try {
      // Check authentication for protected routes
      const isAuthRoute = hash.startsWith('#/auth');
      const isProtectedRoute = !isAuthRoute && !hash.startsWith('#/post/');
      
      if (isProtectedRoute && !state.token) {
        window.location.hash = '#/auth';
        return;
      }

      // Update active nav button
      if (bottomNav) {
        const navButtons = bottomNav.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
          const route = btn.getAttribute('data-route');
          btn.classList.toggle('active', hash === route);
        });
      }

      // Handle route
      let handler = this.routes[hash];
      
      if (!handler) {
        // Handle dynamic routes like #/profile/:username
        if (hash.startsWith('#/profile/')) {
          handler = this.routes['#/profile/:username'];
        } else if (hash.startsWith('#/post/')) {
          handler = this.routes['#/post/:id'];
        }
      }

      if (handler) {
        await handler(hash);
      } else {
        mainContent.innerHTML = `
          <div class="container flex-center" style="height: 60vh;">
            <div class="card">
              <h2>Page non trouvée</h2>
              <p>La page que vous recherchez n'existe pas.</p>
              <button class="btn btn-primary" onclick="window.location.hash = '#/feed'">
                Retour à l'accueil
              </button>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Route error:', error);
      showToast('Erreur lors du chargement de la page', 'error');
    } finally {
      loadingSpinner.style.display = 'none';
    }
  }

  navigateTo(path) {
    window.location.hash = path;
  }
}

// Initialize router
const router = new Router();

// Define routes
router.addRoute('#/auth', renderAuthView);
router.addRoute('#/feed', renderFeedView);
router.addRoute('#/upload', renderUploadView);
router.addRoute('#/profile/me', (hash) => renderProfileView(hash, state.user?.pseudo));
router.addRoute('#/profile/:username', renderProfileView);

// Handle 404 for post view
router.addRoute('#/post/:id', (hash) => {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="container flex-center" style="height: 60vh;">
      <div class="card">
        <h2>Post non trouvé</h2>
        <p>Le post que vous recherchez n'existe pas ou a été supprimé.</p>
        <button class="btn btn-primary" onclick="window.location.hash = '#/feed'">
          Retour à l'accueil
        </button>
      </div>
    </div>
  `;
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  if (state.token) {
    // Verify token is still valid
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        logout();
        if (!window.location.hash.startsWith('#/auth')) {
          window.location.hash = '#/auth';
        }
      }
    })
    .catch(() => {
      logout();
      if (!window.location.hash.startsWith('#/auth')) {
        window.location.hash = '#/auth';
      }
    });
  } else if (!window.location.hash.startsWith('#/auth')) {
    window.location.hash = '#/auth';
  }

  // Add event listeners for navigation
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
      const navBtn = e.target.closest('.nav-btn');
      if (navBtn) {
        e.preventDefault();
        const route = navBtn.getAttribute('data-route');
        router.navigateTo(route);
      }
    });
  }
});

// Make router available globally for navigation
window.router = router;
