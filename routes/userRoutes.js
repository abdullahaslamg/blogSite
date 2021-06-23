const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.getSignUp);
router.post('/login', authController.getLogin);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, authController.updateMe);
router.delete('/deleteMe', authController.protect, authController.deleteMe);

router.route('/').get(userController.getAllUsers);

module.exports = router;
