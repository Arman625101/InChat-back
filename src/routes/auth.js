/* eslint-disable */
const express = require('express');
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
/* eslint-enable */

const auth = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

auth.post('/register', (req, res) => {
  const {
    email, username, password, passwordConf,
  } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (email && username && password === passwordConf) {
      const userData = {
        email,
        username,
        password: hash,
      };
      User.create(userData)
        .then(data => res.send({ data }))
        .catch(error => res.send({ error }));
    } else if (password !== passwordConf) {
      res.send({ error: true, errorMsg: "Passwords don't match" });
    } else {
      res.send({ error: true, errorMsg: 'Something went wrong' });
    }
  });
});

auth.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            failed: 'Unauthorized Access',
          });
        }
        if (result) {
          const JWTToken = jwt.sign(
            {
              email: user.email,
              _id: user._id,
            },
            process.env.JWT_SECRET,
          );
          return res.status(200).send({
            success: 'Welcome to the JWT Auth',
            token: JWTToken,
          });
        }
        return res.send({
          failed: 'Unauthorized Access',
        });
      });
    })
    .catch((err) => {
      res.send({ failed: 'User not registered' });
    });
});

module.exports = auth;
