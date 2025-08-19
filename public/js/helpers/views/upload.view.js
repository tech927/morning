import { api } from '../../api.js';
import { showToast } from '../../ui.js';
import { createMediaInput, createMediaPreview, cleanupMediaPreviews, getMediaType, validateFile } from '../media.js';
import { validatePostText } from '../validators.js';

let selectedFile = null;
let mediaInput = null;
let mediaPreview = null;

export async function renderUploadView() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="container" style="max-width: 600px; margin: 2rem auto;">
      <div class="card animate-in">
        <h2 style="margin-bottom: 1.5rem; text-align: center;">Créer un post</h2>
        
        <form id="upload-form">
          <div class="form-group">
            <label class="form-label">Choisir un média</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <button type="button" class="btn btn-outline" id="select-photo">
                📸 Photo
              </button>
              <button type="button" class="btn btn-outline" id="select-video">
                🎥 Vidéo
              </button>
            </div>
            <div id="media-preview-container"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Description (optionnel)</label>
            <textarea class="form-input form-textarea" name="text" 
                     placeholder="Décrivez votre média..." maxlength="1000"></textarea>
            <div class="form-error" id="text-error"></div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" disabled>
            Publier
          </button>
        </form>
      </div>
    </div>
  `;

  setupUploadEventListeners();
}

function setupUploadEventListeners() {
  // Media selection buttons
  document.getElementById('select-photo').addEventListener('click', () => {
    selectMedia('image/*');
  });

  document.getElementById('select-video').addEventListener('click', () => {
    selectMedia('video/*');
  });

  // Form submission
  document.getElementById('upload-form').addEventListener('submit', handleUpload);
}

function selectMedia(accept) {
  if (!mediaInput) {
    mediaInput = createMediaInput(handleFileSelect, accept);
  } else {
    mediaInput.accept = accept;
  }
  
  mediaInput.click();
}

function handleFileSelect(file) {
  const error = validateFile(file);
  if (error) {
    showToast(error, 'error');
    return;
  }

  selectedFile = file;
  
  // Remove existing preview
  if (mediaPreview) {
    mediaPreview.remove();
    cleanupMediaPreviews();
  }

  // Create new preview
  const container = document.getElementById('media-preview-container');
  mediaPreview = createMediaPreview(file, () => {
    selectedFile = null;
    mediaPreview.remove();
    mediaPreview = null;
    updateSubmitButton();
  });

  container.appendChild(mediaPreview);
  updateSubmitButton();
}

function updateSubmitButton() {
  const submitBtn = document.querySelector('#upload-form button[type="submit"]');
  submitBtn.disabled = !selectedFile;
}

async function handleUpload(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const text = formData.get('text');
  
  // Validate
  const textError = validatePostText(text);
  if (textError) {
    document.getElementById('text-error').textContent = textError;
    return;
  }

  if (!selectedFile) {
    showToast('Veuillez sélectionner un média', 'error');
    return;
  }

  try {
    // Create upload form data
    const uploadData = new FormData();
    uploadData.append('media', selectedFile);
    uploadData.append('text', text);
    uploadData.append('type', getMediaType(selectedFile));
    
    const result = await api.posts.create(uploadData);
    
    showToast('Post publié avec succès!', 'success');
    
    // Reset form
    selectedFile = null;
    if (mediaPreview) {
      mediaPreview.remove();
      mediaPreview = null;
    }
    e.target.reset();
    updateSubmitButton();
    
    // Redirect to feed after a short delay
    setTimeout(() => {
      window.location.hash = '#/feed';
    }, 1500);
    
  } catch (error) {
    showToast(error.message || 'Erreur lors de la publication', 'error');
  }
}

// Cleanup when leaving upload view
export function cleanupUploadView() {
  if (mediaPreview) {
    mediaPreview.remove();
    cleanupMediaPreviews();
  }
  selectedFile = null;
  mediaInput = null;
}
