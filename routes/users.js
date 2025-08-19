import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validate.js';
import { getUserProfile, updateUserProfile } from '../services/user.service.js';
import { getUserPosts } from '../services/post.service.js';

const router = express.Router();

router.get('/:username', async (req, res, next) => {
  try {
    const user = await getUserProfile(req.params.username);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', authenticate, validateProfileUpdate, async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/:username/posts', async (req, res, next) => {
  try {
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await getUserPosts(req.params.username, cursor, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
