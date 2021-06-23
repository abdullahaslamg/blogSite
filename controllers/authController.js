const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const AppError = require('./../util/appError');
const catchAsync = require('./../util/catchAsync');
const User = require('./../models/userSign');
const sendEmail = require('./../util/email');

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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if token exits or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You do not have access to this route', 403));
  }

  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) checking if user exits or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User does not exist', 404));
  }

  // 3) Check if the user changed the password after the token was issued
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again', 403)
    );
  }
  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User not found'));
  }

  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `if you forget your password, then click on the link to reset your password, 
  if you don't forget your password then ignore the message\n ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'token was send to email (valid for 10 minute',
      message
    });
    // const {email} = user;
    // const subject = 'token was send to email (valid for 10 minutes)';
    // await sendEmail(email, subject, message);

    res.send('success');
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });
    next(new AppError(err, 403));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the token and hashed token and compare with the user token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find the user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid'));
  }

  // update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the current user
  const user = await User.findById(req.user._id);

  if (!user) {
    next(new AppError('you do not have at have access to it'));
  }

  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('You current password is incorrect', 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for changing passwords', 400));
  }

  const fiteredObj = req.body;
  const allowed = ['name', 'email'];

  Object.keys(fiteredObj)
    .filter(key => !allowed.includes(key))
    .forEach(key => delete fiteredObj[key]);

  const user = await User.findByIdAndUpdate(req.user._id, fiteredObj, {
    new: true,
    runValidators: true
  });

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(200).send();
});
