import { api } from '../../api.js';
import { showToast, createPostCard } from '../../ui.js';
import { TikTokScroll } from '../scroll.js';
import { state } from '../../state.js';

let tiktokScroll = null;
let posts = [];
let currentCursor = null;
let hasMore = true;

export async function renderFeedView() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div style="height: 100vh; overflow: hidden;">
      <div id="feed-container" style="height: 100%; overflow-y: scroll;">
        <div id="posts-container"></div>
        <div id="loading-more" style="padding: 2rem; text-align: center; display: none;">
          <div class="spinner" style="margin: 0 auto;"></div>
        </div>
      </div>
    </div>
  `;

  await loadPosts();
  setupFeedEventListeners();
}

async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  const loadingMore = document.getElementById('loading-more');
  
  try {
    loadingMore.style.display = 'block';
    
    const result = await api.posts.getFeed(currentCursor);
    const newPosts = result.posts || [];
    
    if (newPosts.length === 0 && posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="container flex-center" style="height: 60vh;">
          <div class="card">
            <h2>Aucun post</h2>
            <p>Soyez le premier à partager quelque chose!</p>
            <button class="btn btn-primary" onclick="window.location.hash = '#/upload'">
              Créer un post
            </button>
          </div>
        </div>
      `;
      return;
    }
    
    posts = [...posts, ...newPosts];
    currentCursor = result.nextCursor;
    hasMore = !!currentCursor;
    
    // Render posts
    if (posts.length > 0) {
      postsContainer.innerHTML = posts.map(post => 
        `<div class="post-item">${createPostCard(post, state.user)}</div>`
      ).join('');
    }
    
    // Initialize TikTok-style scroll
    if (posts.length > 0 && !tiktokScroll) {
      const postItems = Array.from(postsContainer.querySelectorAll('.post-item'));
      tiktokScroll = new TikTokScroll(
        document.getElementById('feed-container'),
        postItems,
        {
          onItemChange: (index, item) => {
            // Auto-play video when in view
            const video = item.querySelector('video');
            if (video) {
              video.play().catch(() => {
                // Autoplay might be blocked by browser
              });
            }
            
            // Pause other videos
            postItems.forEach((otherItem, otherIndex) => {
              if (otherIndex !== index) {
                const otherVideo = otherItem.querySelector('video');
                if (otherVideo) {
                  otherVideo.pause();
                }
              }
            });
          }
        }
      );
    }
    
  } catch (error) {
    showToast('Erreur lors du chargement des posts', 'error');
    console.error('Error loading posts:', error);
  } finally {
    loadingMore.style.display = 'none';
  }
}

function setupFeedEventListeners() {
  // Load more posts when scrolling to bottom
  const feedContainer = document.getElementById('feed-container');
  let isLoading = false;
  
  feedContainer.addEventListener('scroll', async () => {
    if (isLoading || !hasMore) return;
    
    const scrollBottom = feedContainer.scrollHeight - feedContainer.scrollTop - feedContainer.clientHeight;
    
    if (scrollBottom < 500) {
      isLoading = true;
      await loadPosts();
      isLoading = false;
    }
  });

  // Handle post actions (like, comment, share) are handled in ui.js
}

// Cleanup when leaving feed view
export function cleanupFeedView() {
  if (tiktokScroll) {
    tiktokScroll.destroy();
    tiktokScroll = null;
  }
  posts = [];
  currentCursor = null;
  hasMore = true;
}
