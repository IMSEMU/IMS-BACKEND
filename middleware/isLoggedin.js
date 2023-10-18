import jwt from 'jsonwebtoken';

export const isLoggedIn = (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }

    req.user = decoded;
    next();
  });
};