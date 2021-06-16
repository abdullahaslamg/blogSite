const jwt = require('jsonwebtoken');
const AppError = require('./../util/appError');
const catchAsync = require('./../util/catchAsync');
const User = require('./../models/userSign');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.getSignUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});
exports.getLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email or password', 401));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User does not exits, signin first...', 401));
  }

  const checkPassword = await user.correctPassword(
    req.body.password,
    user.password
  );

  if (!checkPassword) {
    return next(new AppError('Your password in incorrect', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
