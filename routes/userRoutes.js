const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.getSignUp)
router.post('/login', authController.getLogin);

router.route('/').get(userController.getAllUsers);

module.exports = router;
