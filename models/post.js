const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A post must have a title']
  },
  content: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // comment: {
  //     type: String,
  //     trim: true
  // },
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'User',
  //   required: [true, 'A comment must belong to a user']
  // }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
