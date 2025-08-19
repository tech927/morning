import { state, logout } from './state.js';
import { showToast } from './ui.js';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    if (state.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        logout();
        showToast('Session expirée, veuillez vous reconnecter', 'error');
        window.location.hash = '#/auth';
        throw new ApiError('Unauthorized', 401);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  },

  async multipartRequest(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`
      },
      body: formData
    });
  },

  // Auth endpoints
  auth: {
    register: (data) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    login: (data) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMe: () => api.request('/auth/me')
  },

  // User endpoints
  users: {
    getProfile: (username) => api.request(`/users/${username}`),
    updateProfile: (data) => api.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    getPosts: (username, cursor) => api.request(`/users/${username}/posts?cursor=${cursor || ''}`)
  },

  // Post endpoints
  posts: {
    create: (formData) => api.multipartRequest('/posts', formData),
    getFeed: (cursor) => api.request(`/posts/feed?cursor=${cursor || ''}`),
    getPost: (id) => api.request(`/posts/${id}`),
    update: (id, data) => api.request(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: (id) => api.request(`/posts/${id}`, {
      method: 'DELETE'
    }),
    like: (id) => api.request(`/posts/${id}/like`, {
      method: 'POST'
    }),
    getLikes: (id) => api.request(`/posts/${id}/likes`),
    share: (id) => api.request(`/posts/${id}/share`, {
      method: 'POST'
    })
  },

  // Comment endpoints
  comments: {
    create: (postId, data) => api.request(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    get: (postId, cursor) => api.request(`/comments/${postId}?cursor=${cursor || ''}`),
    delete: (commentId) => api.request(`/comments/${commentId}`, {
      method: 'DELETE'
    })
  },

  // Follow endpoints
  follow: {
    toggle: (username) => api.request(`/follow/${username}`, {
      method: 'POST'
    }),
    getFollowers: (username) => api.request(`/follow/${username}/followers`),
    getFollowing: (username) => api.request(`/follow/${username}/following`)
  },

  // Upload endpoints
  upload: {
    media: (formData) => api.multipartRequest('/upload/media', formData)
  }
};

// Global error handler for API calls
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof ApiError) {
    if (event.reason.status !== 401) { // Don't show toast for 401 (handled elsewhere)
      showToast(event.reason.message, 'error');
    }
    event.preventDefault();
  }
});
