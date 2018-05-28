const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const auth = require('./routes/auth');
require('dotenv').config();
const User = require('./models/user');
const jwtVerify = require('./middleware/jwtVerify');

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.DB_HOST}:29540/inchat`);
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/auth', auth);
app.use(jwtVerify);

app.post('/user/:email', (req, res) => {
  console.log(req.body.email);
  User.findOne({ email: req.body.email })
    .exec()
    .then(user => console.log(user));
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
    users = users.filter(item => item.id !== socket.id);
    io.emit('get_users', users);
  });
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
