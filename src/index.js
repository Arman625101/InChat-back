const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// const cors = require('cors');
require('dotenv').config();

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.DB_HOST}:29540/inchat`);

const db = mongoose.connection;
const User = require('./models/user');

db.once('open', () => {
  console.log('succesfull');
});
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'hermine',
  resave: true,
  saveUninitialized: false,
}));

app.get('/', (req, res) => res.send());

app.get('/profile', (req, res, next) => {
  User.findById(req.session.userId).exec((err, user) => {
    if (err) next(err);
    res.json({ name: user.name, email: user.email });
  });
});

app.post('/new-user', (req, res, next) => {
  const {
    email, username, password, passwordConf,
  } = req.body;
  if (password !== passwordConf) {
    const err = new Error('Passwords do not match.');
    err.status = 400;
    res.send(err);
    next(err);
  }

  if (email && username && password && passwordConf) {
    const userData = {
      email,
      username,
      password,
      passwordConf,
    };
    User.create(userData, (err, user) => {
      if (err) next(err);
      req.session.userId = user._id;
      // res.redirect('/profile');
    });
  }
});

let users = [];

io.on('connection', (socket) => {
  let addedUser = false;
  // New user
  socket.on('add_user', (name) => {
    if (addedUser) return;
    addedUser = true;
    users = [...users, { name, id: socket.id }];
    io.emit('get_users', users);
  });
  // New message
  socket.on('send_message', data => io.emit('get_messages', data));
  // Disconnect
  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    io.emit('get_users', users);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
