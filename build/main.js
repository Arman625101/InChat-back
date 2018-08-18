require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const mongoose = __webpack_require__(0);

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(6);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const app = __webpack_require__(1)();
const http = __webpack_require__(7).Server(app);
const io = __webpack_require__(8)(http);
const bodyParser = __webpack_require__(9);
const mongoose = __webpack_require__(0);
const auth = __webpack_require__(10);
__webpack_require__(4).config();
const User = __webpack_require__(2);
const jwtVerify = __webpack_require__(12);
const cors = __webpack_require__(13);

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.DB_HOST}:29540/inchat`);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/auth', auth);
// app.use(jwtVerify);

app.post('/user', (req, res) => {
  User.findOne({ email: req.body.email }).exec().then(user => res.send(user));
});

let users = [];
io.on('connection', socket => {
  let addedUser = false;
  // New user
  socket.on('add_user', name => {
    if (addedUser) return;
    addedUser = true;
    users = [...users, { name, id: socket.id }];
    io.emit('get_users', users);
  });
  // New message
  socket.on('send_message', data => io.emit('get_messages', data));
  // Disconnect
  socket.on('disconnect', () => {
    users = users.filter(item => item.id !== socket.id);
    io.emit('get_users', users);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable */
const express = __webpack_require__(1);
const User = __webpack_require__(2);
const mongoose = __webpack_require__(0);
const bcrypt = __webpack_require__(11);
/* eslint-enable */

const auth = express.Router();
const jwt = __webpack_require__(3);
__webpack_require__(4).config();

auth.post('/register', (req, res) => {
  const {
    email, username, password, passwordConf
  } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (email && username && password === passwordConf) {
      const userData = {
        email,
        username,
        password: hash
      };
      User.create(userData).then(data => res.send({ data })).catch(error => res.send({ error }));
    } else if (password !== passwordConf) {
      res.send({ error: true, errorMsg: "Passwords don't match" });
    } else {
      res.send({ error: true, errorMsg: 'Something went wrong' });
    }
  });
});

auth.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }).exec().then(user => {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(401).json({
          failed: 'Unauthorized Access'
        });
      }
      if (result) {
        const JWTToken = jwt.sign({
          email: user.email,
          _id: user._id
        }, process.env.JWT_SECRET);
        return res.status(200).send({
          success: 'Welcome to the JWT Auth',
          token: JWTToken
        });
      }
      return res.send({
        failed: 'Unauthorized Access'
      });
    });
  }).catch(err => {
    res.send({ failed: 'User not registered' });
  });
});

module.exports = auth;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("bcrypt");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const jwt = __webpack_require__(3);

const jwtVerify = (req, res, next) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, err => {
    if (err) {
      return res.send({ error: 'BAD TOKEN' });
    }
    next();
  });
};

module.exports = jwtVerify;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ })
/******/ ]);
//# sourceMappingURL=main.map