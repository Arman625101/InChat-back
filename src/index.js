const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

let users = [];
io.on('connection', (socket) => {
  let addedUser = false;
  socket.on('add_user', (user) => {
    if (addedUser) return;
    addedUser = true;
    users = [...users, user];
    io.emit('get_users', users);
  });
  socket.on('send_message', text => io.emit('get_messages', text));
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
