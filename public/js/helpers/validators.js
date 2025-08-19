export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email requis';
  if (!emailRegex.test(email)) return 'Email invalide';
  return null;
};

export const validatePseudo = (pseudo) => {
  if (!pseudo) return 'Pseudo requis';
  if (pseudo.length < 3) return 'Le pseudo doit faire au moins 3 caractères';
  if (pseudo.length > 20) return 'Le pseudo ne doit pas dépasser 20 caractères';
  if (!/^[a-zA-Z0-9_]+$/.test(pseudo)) return 'Le pseudo ne peut contenir que des lettres, chiffres et underscores';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Mot de passe requis';
  if (password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères';
  return null;
};

export const validatePostText = (text) => {
  if (text && text.length > 1000) return 'Le texte ne doit pas dépasser 1000 caractères';
  return null;
};

export const validateComment = (text) => {
  if (!text) return 'Commentaire requis';
  if (text.length > 500) return 'Le commentaire ne doit pas dépasser 500 caractères';
  return null;
};

export const validateFile = (file, maxSize = 25 * 1024 * 1024) => {
  if (!file) return 'Fichier requis';
  
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Type de fichier non supporté. Seules les images (JPEG, PNG, GIF) et vidéos (MP4) sont autorisées';
  }
  
  if (file.size > maxSize) {
    return `Le fichier ne doit pas dépasser ${maxSize / 1024 / 1024}MB`;
  }
  
  return null;
};
