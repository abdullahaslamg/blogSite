const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    min: 5
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function(pass) {
        return pass === this.password;
      },
      message: 'Passwords are not name'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async (currentPassword, userPassword) => {
  return await bcrypt.compare(currentPassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
