import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const SALT_ROUNDS = 12;

export const getUserProfile = async (username) => {
  const user = await User.findOne({ pseudo: username })
    .select('-passwordHash')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.pseudo && updateData.pseudo !== user.pseudo) {
    const existingUser = await User.findOne({ pseudo: updateData.pseudo });
    if (existingUser) {
      throw new Error('Pseudo already taken');
    }
    user.pseudo = updateData.pseudo;
  }

  if (updateData.bio !== undefined) {
    user.bio = updateData.bio;
  }

  if (updateData.password) {
    user.passwordHash = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

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
