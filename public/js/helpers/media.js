export function createMediaInput(onFileSelect, accept = 'image/*,video/*') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.capture = 'environment'; // Use camera on mobile
  input.style.display = 'none';
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  });
  
  document.body.appendChild(input);
  return input;
}

export function createMediaPreview(file, onRemove) {
  const container = document.createElement('div');
  container.className = 'media-preview';
  container.style.position = 'relative';
  container.style.margin = '1rem 0';
  
  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '×';
  removeBtn.style.position = 'absolute';
  removeBtn.style.top = '0.5rem';
  removeBtn.style.right = '0.5rem';
  removeBtn.style.background = 'rgba(0,0,0,0.7)';
  removeBtn.style.color = 'white';
  removeBtn.style.border = 'none';
  removeBtn.style.borderRadius = '50%';
  removeBtn.style.width = '2rem';
  removeBtn.style.height = '2rem';
  removeBtn.style.cursor = 'pointer';
  removeBtn.style.zIndex = '10';
  
  removeBtn.addEventListener('click', onRemove);
  
  let mediaElement;
  if (file.type.startsWith('image/')) {
    mediaElement = document.createElement('img');
    mediaElement.src = URL.createObjectURL(file);
    mediaElement.style.maxHeight = '300px';
    mediaElement.style.width = 'auto';
  } else if (file.type.startsWith('video/')) {
    mediaElement = document.createElement('video');
    mediaElement.src = URL.createObjectURL(file);
    mediaElement.controls = true;
    mediaElement.style.maxHeight = '300px';
    mediaElement.style.width = 'auto';
  }
  
  mediaElement.style.borderRadius = 'var(--border-radius)';
  mediaElement.style.objectFit = 'contain';
  
  const info = document.createElement('div');
  info.style.marginTop = '0.5rem';
  info.style.fontSize = '0.875rem';
  info.style.color = 'var(--text-muted)';
  info.textContent = `${file.name} (${formatFileSize(file.size)})`;
  
  container.appendChild(removeBtn);
  container.appendChild(mediaElement);
  container.appendChild(info);
  
  return container;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMediaType(file) {
  if (file.type.startsWith('image/')) return 'photo';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

export function cleanupMediaPreviews() {
  // Revoke object URLs to prevent memory leaks
  document.querySelectorAll('.media-preview img, .media-preview video').forEach(media => {
    if (media.src.startsWith('blob:')) {
      URL.revokeObjectURL(media.src);
    }
  });
}
