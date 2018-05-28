const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.send({ error: 'BAD TOKEN' });
    }
    next();
  });
};

module.exports = jwtVerify;
