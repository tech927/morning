import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';

const router = express.Router();

router.post('/:username', authenticate, async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ pseudo: req.params.username });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: targetUser._id
    });

    let isFollowing = false;

    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUser._id, { $inc: { followersCount: -1 } });
    } else {
      const follow = new Follow({
        follower: req.user._id,
        following: targetUser._id
      });
      await follow.save();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(targetUser._id, { $inc: { followersCount: 1 } });
      isFollowing = true;
    }

    res.json({ isFollowing });
  } catch (error) {
    next(error);
  }
});

router.get('/:username/followers', async (req, res, next) => {
  try {
    const user = await User.findOne({ pseudo: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await Follow.find({ following: user._id })
      .populate('follower', 'pseudo')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ followers });
  } catch (error) {
    next(error);
  }
});

router.get('/:username/following', async (req, res, next) => {
  try {
    const user = await User.findOne({ pseudo: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await Follow.find({ follower: user._id })
      .populate('following', 'pseudo')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ following });
  } catch (error) {
    next(error);
  }
});

export default router;
