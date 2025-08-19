import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/limiter.js';
import { upload } from '../services/media.service.js';

const router = express.Router();

router.post('/media', authenticate, uploadLimiter, upload.single('media'), (req, res) => {
  res.json({
    message: 'File uploaded successfully',
    fileId: req.file.id,
    filename: req.file.filename
  });
});

export default router;
