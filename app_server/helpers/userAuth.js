const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

const generateToken = (userId) => {
  try {
    return jwt.sign({ userId }, "asdfghjkl123453", { expiresIn: '7d' });
  } catch (error) {
    throw new Error('Error generating token');
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken
};
