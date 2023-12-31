const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 60*1000, 
  max: 20, 
  handler(req, res) { 
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: '요청 횟수 초과'
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code:410,
    message: '새로운 버전이 나왔습니다. 새로운 버전을 사용하세요'
  });
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    res.locals.decoded = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') { 
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다',
    });
  }
};
