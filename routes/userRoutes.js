const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.getSignUp)
router.post('/login', authController.getLogin);

module.exports = router;
