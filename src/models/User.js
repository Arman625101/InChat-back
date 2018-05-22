const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  },
});
const User = mongoose.model('User', UserSchema);

// authenticate input against database
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({ email }).exec((err, user) => {
    if (err) {
      callback(err);
    } else if (!user) {
      const error = new Error('User not found.');
      error.status = 401;
      callback(error);
    }
    bcrypt.compare(password, user.password, (error, result) => {
      if (result === true) {
        return callback(null, user);
      }
      return callback();
    });
  });
};

// hashing a password before saving it to the database
/* eslint-disable func-names */
UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      next(err);
    }
    this.password = hash;
    next();
  });
});
/* eslint-enable */

module.exports = User;
