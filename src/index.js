const app = require('express')();
const http = require('http').Server(app);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
