import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  text: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'media',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

export default mongoose.model('Post', postSchema);
