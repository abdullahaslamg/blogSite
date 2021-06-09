const AppError = require('./../util/appError');
const catchAsync = require('./../util/catchAsync');
const User = require('./../models/userSign');

exports.getSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const checkMail = await User.findOne({ email: req.body.email });
  if (checkMail) {
    next(new AppError('User already exists', 401));
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
exports.getLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email or password'));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User does not exits, signin first...'));
  }

  const checkPassword = await user.correctPassword(
    req.body.password,
    user.password
  );
  console.log(checkPassword);

  if (!checkPassword) {
    return next(new AppError('Your password in incorrect'));
  }

  res.status(200).json({
    status: 'success',
    message: 'You have successfully login'
  });
});
