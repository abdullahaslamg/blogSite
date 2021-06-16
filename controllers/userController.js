const User = require('../models/userSign');
const catchAsync = require('../util/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v');

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});
