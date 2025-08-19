import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateComment } from '../middleware/validate.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const router = express.Router();

router.post('/:postId', authenticate, validateComment, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      post: req.params.postId,
      author: req.user._id,
      text: req.body.text
    });

    await comment.save();
    await comment.populate('author', 'pseudo');
    
    // Update comments count
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
});

router.get('/:postId', async (req, res, next) => {
  try {
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 20;

    const query = { post: req.params.postId };
    
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const comments = await Comment.find(query)
      .populate('author', 'pseudo')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasNext = comments.length > limit;
    if (hasNext) {
      comments.pop();
    }

    const nextCursor = hasNext ? comments[comments.length - 1]._id : null;

    res.json({ comments, nextCursor });
  } catch (error) {
    next(error);
  }
});

router.delete('/:commentId', authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      author: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    await Comment.deleteOne({ _id: req.params.commentId });
    
    // Update comments count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
