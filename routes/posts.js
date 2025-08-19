import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validatePost } from '../middleware/validate.js';
import { upload } from '../services/media.service.js';
import {
  createPost,
  getPost,
  getFeed,
  updatePost,
  deletePost,
  toggleLike,
  getPostLikes
} from '../services/post.service.js';

const router = express.Router();

router.post('/', authenticate, upload.single('media'), validatePost, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Media file is required' });
    }

    const post = await createPost(req.user._id, req.body, req.file.id);
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.get('/feed', authenticate, async (req, res, next) => {
  try {
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await getFeed(req.user._id, cursor, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await getPost(req.params.id);
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.user._id, req.body);
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await deletePost(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const result = await toggleLike(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/likes', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const likes = await getPostLikes(req.params.id, limit);
    res.json({ likes });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/share', async (req, res, next) => {
  try {
    const post = await getPost(req.params.id);
    const shareUrl = `${req.protocol}://${req.get('host')}/#/post/${post._id}`;
    res.json({ shareUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
