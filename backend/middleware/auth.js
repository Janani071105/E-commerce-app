const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('auth-token');
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access Denied: Admin privileges required' });
    }
  });
};
module.exports = { verifyToken, verifyAdmin };