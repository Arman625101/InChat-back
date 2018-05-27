const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');

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
      User.create(userData).catch(error => res.status(500).json({ error }));
    } else if (password !== passwordConf) {
      res.send({ error: "Passwords don't match" });
    } else {
      res.send({ error: 'all fields required' });
    }
  });
});

auth.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).send({
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
        return res.status(401).send({
          failed: 'Unauthorized Access',
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ error: 'User not registered' });
    });
});

module.exports = auth;
