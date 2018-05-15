const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

const users = [];
io.on('connection', (socket) => {
  const addedUser = false;
  // socket.on('add user', (username) => {
  //   if (addedUser) return;
  //   addedUser = true;
  //   users = [...users, { username }];
  // });
  // socket.emit('users', users);
  socket.on('send_message', text => io.emit('get_message', text));
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
