import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { config } from '../config/env.js';
import { getGridFS } from '../config/gridfs.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const storage = new GridFsStorage({
  url: config.MONGODB_URI,
  file: (req, file) => {
    return {
      bucketName: 'media',
      filename: `${Date.now()}-${file.originalname}`,
      metadata: {
        userId: req.user._id,
        originalName: file.originalname,
        uploadDate: new Date()
      }
    };
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

export const getMediaInfo = async (fileId) => {
  const bucket = getGridFS();
  const files = await bucket.find({ _id: fileId }).toArray();
  
  if (!files || files.length === 0) {
    throw new Error('File not found');
  }

  return files[0];
};

export const deleteMedia = async (fileId) => {
  const bucket = getGridFS();
  await bucket.delete(fileId);
};
