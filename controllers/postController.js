const Post = require('./../models/post');
const catchAsync = require('./../util/catchAsync');

// Get all posts
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();

  res.status(201).json({
    status: 'success',
    data: {
      posts
    }
  });
});

// create a new post
exports.createPost = catchAsync(async (req, res, next) => {
  const post = await Post.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      post
    }
  });
});

// update a post
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'succuess',
    data: {
      post
    }
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(200).send('');
});
