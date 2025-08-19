import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

export const createPost = async (authorId, postData, mediaId) => {
  const post = new Post({
    author: authorId,
    type: postData.type,
    text: postData.text,
    mediaId
  });

  await post.save();
  await post.populate('author', 'pseudo');

  return post;
};

export const getPost = async (postId) => {
  const post = await Post.findById(postId)
    .populate('author', 'pseudo followersCount followingCount')
    .lean();

  if (!post || post.isDeleted) {
    throw new Error('Post not found');
  }

  return post;
};

export const getFeed = async (userId, cursor = null, limit = 10) => {
  const query = { isDeleted: false };
  
  if (cursor) {
    const cursorPost = await Post.findById(cursor);
    if (cursorPost) {
      query.createdAt = { $lt: cursorPost.createdAt };
    }
  }

  const posts = await Post.find(query)
    .populate('author', 'pseudo followersCount followingCount')
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasNext = posts.length > limit;
  if (hasNext) {
    posts.pop();
  }

  const nextCursor = hasNext ? posts[posts.length - 1]._id : null;

  return { posts, nextCursor };
};

export const getUserPosts = async (username, cursor = null, limit = 10) => {
  const user = await User.findOne({ pseudo: username });
  if (!user) {
    throw new Error('User not found');
  }

  const query = { author: user._id, isDeleted: false };
  
  if (cursor) {
    const cursorPost = await Post.findById(cursor);
    if (cursorPost) {
      query.createdAt = { $lt: cursorPost.createdAt };
    }
  }

  const posts = await Post.find(query)
    .populate('author', 'pseudo followersCount followingCount')
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasNext = posts.length > limit;
  if (hasNext) {
    posts.pop();
  }

  const nextCursor = hasNext ? posts[posts.length - 1]._id : null;

  return { posts, nextCursor };
};

export const updatePost = async (postId, userId, updateData) => {
  const post = await Post.findOne({ _id: postId, author: userId });
  if (!post) {
    throw new Error('Post not found or unauthorized');
  }

  if (updateData.text !== undefined) {
    post.text = updateData.text;
  }

  await post.save();
  return post;
};

export const deletePost = async (postId, userId) => {
  const post = await Post.findOne({ _id: postId, author: userId });
  if (!post) {
    throw new Error('Post not found or unauthorized');
  }

  post.isDeleted = true;
  await post.save();
  
  return { message: 'Post deleted successfully' };
};

export const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post || post.isDeleted) {
    throw new Error('Post not found');
  }

  const likeIndex = post.likes.indexOf(userId);
  let liked = false;

  if (likeIndex === -1) {
    post.likes.push(userId);
    liked = true;
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();
  return { liked, likesCount: post.likes.length };
};

export const getPostLikes = async (postId, limit = 20) => {
  const post = await Post.findById(postId)
    .populate({
      path: 'likes',
      select: 'pseudo',
      options: { limit }
    })
    .lean();

  if (!post || post.isDeleted) {
    throw new Error('Post not found');
  }

  return post.likes;
};
