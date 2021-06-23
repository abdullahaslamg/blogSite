const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(postController.createPost)
  .get(authController.protect,postController.getAllPosts);

router
  .route('/:id')
  .patch(postController.updatePost)
  .delete(postController.deletePost);


module.exports = router;
