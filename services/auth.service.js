import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';

const SALT_ROUNDS = 12;

export const registerUser = async (userData) => {
  const { pseudo, email, password } = userData;
  
  const existingUser = await User.findOne({
    $or: [{ email }, { pseudo }]
  });

  if (existingUser) {
    throw new Error('User already exists with this email or pseudo');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const user = new User({
    pseudo,
    email,
    passwordHash
  });

  await user.save();
  
  return {
    id: user._id,
    pseudo: user.pseudo,
    email: user.email,
    bio: user.bio,
    followersCount: user.followersCount,
    followingCount: user.followingCount
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      bio: user.bio,
      followersCount: user.followersCount,
      followingCount: user.followingCount
    }
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
