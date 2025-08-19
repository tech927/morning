import { api } from '../../api.js';
import { showToast, createUserBadge, createPostCard } from '../../ui.js';
import { InfiniteScroll } from '../scroll.js';
import { state, updateUser } from '../../state.js';

let infiniteScroll = null;
let posts = [];
let currentCursor = null;
let hasMore = true;
let currentUserProfile = null;

export async function renderProfileView(hash, usernameParam = null) {
  const username = usernameParam || hash.split('/').pop();
  const isOwnProfile = username === 'me' || username === state.user?.pseudo;
  const profileUsername = isOwnProfile ? state.user.pseudo : username;

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="container" style="max-width: 800px; margin: 0 auto;">
      <div class="animate-in">
        <div id="profile-header" style="margin-bottom: 2rem;"></div>
        
        ${isOwnProfile ? `
          <div class="card" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">Paramètres</h3>
            <div style="display: grid; gap: 1rem;">
              <button class="btn btn-outline" id="edit-profile-btn">
                ✏️ Modifier le profil
              </button>
              <button class="btn btn-outline" id="change-password-btn">
                🔒 Changer le mot de passe
              </button>
              <button class="btn btn-outline" id="logout-btn" style="color: var(--error);">
                🚪 Déconnexion
              </button>
            </div>
          </div>
        ` : ''}

        <div>
          <h3 style="margin-bottom: 1rem;">Publications</h3>
          <div id="profile-posts"></div>
          <div id="loading-more" style="padding: 2rem; text-align: center; display: none;">
            <div class="spinner" style="margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadUserProfile(profileUsername, isOwnProfile);
  await loadProfilePosts(profileUsername);
  setupProfileEventListeners(isOwnProfile);
}

async function loadUserProfile(username, isOwnProfile) {
  try {
    let userData;
    
    if (isOwnProfile) {
      const result = await api.auth.getMe();
      userData = result.user;
    } else {
      const result = await api.users.getProfile(username);
      userData = result.user;
    }
    
    currentUserProfile = userData;
    
    const profileHeader = document.getElementById('profile-header');
    profileHeader.innerHTML = `
      <div class="card">
        ${createUserBadge(userData, !isOwnProfile)}
      </div>
    `;
    
  } catch (error) {
    showToast('Erreur lors du chargement du profil', 'error');
    console.error('Error loading profile:', error);
  }
}

async function loadProfilePosts(username, append = false) {
  const postsContainer = document.getElementById('profile-posts');
  const loadingMore = document.getElementById('loading-more');
  
  if (!append) {
    posts = [];
    currentCursor = null;
    hasMore = true;
  }
  
  try {
    loadingMore.style.display = 'block';
    
    const result = await api.users.getPosts(username, currentCursor);
    const newPosts = result.posts || [];
    
    posts = append ? [...posts, ...newPosts] : newPosts;
    currentCursor = result.nextCursor;
    hasMore = !!currentCursor;
    
    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="card">
          <p style="text-align: center; color: var(--text-muted);">
            ${username === state.user?.pseudo ? 'Vous n\'avez' : 'Cet utilisateur n\'a'} 
            encore rien publié.
          </p>
        </div>
      `;
      return;
    }
    
    postsContainer.innerHTML = posts.map(post => 
      `<div class="post-item" style="margin-bottom: 1rem;">${createPostCard(post, state.user)}</div>`
    ).join('');
    
    // Setup infinite scroll if not already set up
    if (!infiniteScroll && hasMore) {
      infiniteScroll = new InfiniteScroll(
        document.getElementById('main-content'),
        () => loadProfilePosts(username, true),
        { hasMore: true }
      );
    }
    
    if (infiniteScroll) {
      infiniteScroll.setHasMore(hasMore);
    }
    
  } catch (error) {
    showToast('Erreur lors du chargement des posts', 'error');
    console.error('Error loading profile posts:', error);
  } finally {
    loadingMore.style.display = 'none';
  }
}

function setupProfileEventListeners(isOwnProfile) {
  // Logout button
  if (isOwnProfile) {
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.state.setState({
          user: null,
          token: null
        });
        showToast('Déconnexion réussie', 'success');
        window.location.hash = '#/auth';
      }
    });

    // Edit profile button
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      showEditProfileModal();
    });

    // Change password button
    document.getElementById('change-password-btn').addEventListener('click', () => {
      showChangePasswordModal();
    });
  }
}

function showEditProfileModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content animate-scale-in">
      <h3 style="margin-bottom: 1rem;">Modifier le profil</h3>
      <form id="edit-profile-form">
        <div class="form-group">
          <label class="form-label">Pseudo</label>
          <input type="text" class="form-input" name="pseudo" 
                 value="${currentUserProfile.pseudo}" required maxlength="20">
        </div>
        <div class="form-group">
          <label class="form-label">Bio</label>
          <textarea class="form-input form-textarea" name="bio" 
                    placeholder="Décrivez-vous..." maxlength="500">${currentUserProfile.bio || ''}</textarea>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-outline" style="flex: 1;" id="cancel-edit">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('#cancel-edit').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const result = await api.users.updateProfile(data);
      updateUser(result.user);
      showToast('Profil mis à jour avec succès', 'success');
      modal.remove();
      await renderProfileView(window.location.hash);
    } catch (error) {
      showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    }
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showChangePasswordModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content animate-scale-in">
      <h3 style="margin-bottom: 1rem;">Changer le mot de passe</h3>
      <form id="change-password-form">
        <div class="form-group">
          <label class="form-label">Nouveau mot de passe</label>
          <input type="password" class="form-input" name="password" required minlength="6">
        </div>
        <div class="form-group">
          <label class="form-label">Confirmer le mot de passe</label>
          <input type="password" class="form-input" name="confirmPassword" required minlength="6">
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-outline" style="flex: 1;" id="cancel-password">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            Changer
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('#cancel-password').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (data.password !== data.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    try {
      await api.users.updateProfile({ password: data.password });
      showToast('Mot de passe changé avec succès', 'success');
      modal.remove();
    } catch (error) {
      showToast(error.message || 'Erreur lors du changement', 'error');
    }
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Cleanup when leaving profile view
export function cleanupProfileView() {
  if (infiniteScroll) {
    infiniteScroll.disconnect();
    infiniteScroll = null;
  }
  posts = [];
  currentCursor = null;
  hasMore = true;
  currentUserProfile = null;
    }
