import { api } from './api.js';
import { state } from './state.js';

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function createPostCard(post, currentUser) {
  const isLiked = post.likes && post.likes.includes(currentUser?.id);
  const isAuthor = post.author._id === currentUser?.id;

  return `
    <div class="card post-card" data-post-id="${post._id}">
      <div class="user-badge">
        <div class="user-avatar">
          ${post.author.pseudo.charAt(0).toUpperCase()}
        </div>
        <div class="user-info">
          <strong>${post.author.pseudo}</strong>
          <div class="user-stats">
            <div class="stat">
              <div class="stat-number">${post.author.followersCount || 0}</div>
              <div class="stat-label">Abonnés</div>
            </div>
            <div class="stat">
              <div class="stat-number">${post.author.followingCount || 0}</div>
              <div class="stat-label">Abonnements</div>
            </div>
          </div>
        </div>
        ${!isAuthor ? `
          <button class="btn btn-sm btn-outline follow-btn" data-username="${post.author.pseudo}">
            Suivre
          </button>
        ` : ''}
      </div>

      ${post.text ? `
        <div class="post-text" style="margin: 1rem 0;">
          ${escapeHtml(post.text)}
        </div>
      ` : ''}

      <div class="media-container">
        ${post.type === 'photo' ? `
          <img src="/api/media/${post.mediaId}" alt="Post image" loading="lazy">
        ` : `
          <video controls>
            <source src="/api/media/stream/${post.mediaId}" type="video/mp4">
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        `}
      </div>

      <div class="post-actions">
        <button class="action-btn like-btn ${isLiked ? 'active' : ''}" data-post-id="${post._id}">
          <span>${isLiked ? '❤️' : '🤍'}</span>
          <span>${post.likesCount || 0}</span>
        </button>
        
        <button class="action-btn comment-btn" data-post-id="${post._id}">
          <span>💬</span>
          <span>${post.commentsCount || 0}</span>
        </button>
        
        <button class="action-btn share-btn" data-post-id="${post._id}">
          <span>↗️</span>
          <span>Partager</span>
        </button>
      </div>
    </div>
  `;
}

export function createUserBadge(user, showFollowButton = false) {
  const isCurrentUser = user._id === state.user?.id;
  const isFollowing = user.isFollowing; // This would need to be populated from API

  return `
    <div class="user-badge">
      <div class="user-avatar">
        ${user.pseudo.charAt(0).toUpperCase()}
      </div>
      <div class="user-info">
        <strong>${user.pseudo}</strong>
        <p>${user.bio || 'Aucune bio'}</p>
        <div class="user-stats">
          <div class="stat">
            <div class="stat-number">${user.followersCount || 0}</div>
            <div class="stat-label">Abonnés</div>
          </div>
          <div class="stat">
            <div class="stat-number">${user.followingCount || 0}</div>
            <div class="stat-label">Abonnements</div>
          </div>
        </div>
      </div>
      ${showFollowButton && !isCurrentUser ? `
        <button class="btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'} follow-btn" 
                data-username="${user.pseudo}">
          ${isFollowing ? 'Suivi' : 'Suivre'}
        </button>
      ` : ''}
    </div>
  `;
}

export function renderBottomNav() {
  return `
    <nav class="bottom-nav" id="bottom-nav">
      <button class="nav-btn" data-route="#/feed">
        <span>🏠</span>
        <span>Accueil</span>
      </button>
      <button class="nav-btn" data-route="#/upload">
        <span>➕</span>
        <span>Upload</span>
      </button>
      <button class="nav-btn" data-route="#/profile/me">
        <span>👤</span>
        <span>Profil</span>
      </button>
    </nav>
  `;
}

export function setupEventListeners() {
  // Like button handler
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.like-btn')) {
      const likeBtn = e.target.closest('.like-btn');
      const postId = likeBtn.dataset.postId;
      
      try {
        const result = await api.posts.like(postId);
        
        // Update UI
        const likeCountEl = likeBtn.querySelector('span:last-child');
        const heartEl = likeBtn.querySelector('span:first-child');
        
        likeCountEl.textContent = result.likesCount;
        heartEl.textContent = result.liked ? '❤️' : '🤍';
        likeBtn.classList.toggle('active', result.liked);
        
      } catch (error) {
        showToast('Erreur lors du like', 'error');
      }
    }

    // Follow button handler
    if (e.target.closest('.follow-btn')) {
      const followBtn = e.target.closest('.follow-btn');
      const username = followBtn.dataset.username;
      
      try {
        const result = await api.follow.toggle(username);
        
        // Update UI
        if (followBtn.classList.contains('btn-primary')) {
          followBtn.classList.remove('btn-primary');
          followBtn.classList.add('btn-outline');
          followBtn.textContent = 'Suivi';
        } else {
          followBtn.classList.remove('btn-outline');
          followBtn.classList.add('btn-primary');
          followBtn.textContent = 'Suivre';
        }
        
        showToast(result.isFollowing ? `Vous suivez maintenant ${username}` : `Vous ne suivez plus ${username}`);
        
      } catch (error) {
        showToast('Erreur lors du follow', 'error');
      }
    }

    // Share button handler
    if (e.target.closest('.share-btn')) {
      const shareBtn = e.target.closest('.share-btn');
      const postId = shareBtn.dataset.postId;
      
      try {
        const result = await api.posts.share(postId);
        
        // Use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: 'Morning Stars Info',
            text: 'Regarde ce post sur Morning Stars!',
            url: result.shareUrl
          });
        } else {
          // Fallback to copy to clipboard
          await navigator.clipboard.writeText(result.shareUrl);
          showToast('Lien copié dans le presse-papier!');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          showToast('Erreur lors du partage', 'error');
        }
      }
    }

    // User profile click handler
    if (e.target.closest('.user-badge') && !e.target.closest('.follow-btn')) {
      const userBadge = e.target.closest('.user-badge');
      const username = userBadge.querySelector('strong').textContent;
      window.location.hash = `#/profile/${username}`;
    }
  });
}

// Helper function to escape HTML
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', setupEventListeners);
