import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const hashPassword = async (password) => {
  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, rounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  return {
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  }
}

const formatResponse = (success, data = null, message = null, error = null) => {
  const response = { success }

  if (data !== null) response.data = data
  if (message) response.message = message
  if (error) response.error = error

  return response
}

export { generateToken, hashPassword, comparePassword, paginate, formatResponse };
