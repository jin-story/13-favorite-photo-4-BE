import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "./user.repository.js";

function hashedPassword(encryptedPassword) {
  return bcrypt.hash(encryptedPassword, 10);
}

async function verifyPassword(inputPassword, encryptedPassword) {
  const isMatch = await bcrypt.compare(inputPassword, encryptedPassword);
  if (!isMatch) {
    const error = new Error("비밀번호가 일치하지 않습니다.");
    error.code = 401;
    throw error;
  }
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const isRefreshToken = type === "refreshToken";
  const secret = isRefreshToken
    ? process.env.JWT_REFRESH_SECRET
    : process.env.JWT_ACCESS_SECRET;
  const token = jwt.sign(payload, secret, {
    expiresIn: isRefreshToken ? "2w" : "1h",
  });
  return token;
}

async function refreshToken(userId, refreshToken) {
  const user = await userRepository.findById(userId);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("접근 권한이 없습니다.");
    error.code = 403;
    throw error;
  }
  const newAccessToken = createToken(user);
  const newRefreshToken = createToken(user, "refreshToken");
  return { newAccessToken, newRefreshToken };
}

function filterSensitiveUserData(user) {
  const { encryptedPassword, refreshToken, ...rest } = user;
  return rest;
}

async function createUser(user) {
  try {
    const hasUser = await userRepository.findByEmail(user.email);
    if (hasUser) {
      const error = new Error("이미 존재하는 사용자입니다.");
      error.code = 409;
      error.data = { email: user.email };
      throw error;
    }
    const hashed = await hashedPassword(user.encryptedPassword);
    const createdUser = await userRepository.save({
      ...user,
      encryptedPassword: hashed,
    });
    return filterSensitiveUserData(createdUser);
  } catch (error) {
    if (error.code === 409) throw error;
    const customError = new Error("서버 내부적 오류가 발생했습니다.");
    customError.code = 500;
    throw customError;
  }
}

async function getUser(email, inputPassword) {
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("존재하지 않는 이메일입니다.");
      error.code = 401;
      throw error;
    }
    await verifyPassword(inputPassword, user.encryptedPassword);
    return filterSensitiveUserData(user);
  } catch (error) {
    if (error.code === 401) throw error;
    const customError = new Error("서버 내부적 오류가 발생했습니다.");
    customError.code = 500;
    throw customError;
  }
}

async function updateUser(id, data) {
  const updateUser = await userRepository.update(id, data);
  return filterSensitiveUserData(updateUser);
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("존재하지 않는 유저입니다");
    error.code = 404;
    throw error;
  }
  return filterSensitiveUserData(user);
}

export default {
  createToken,
  refreshToken,
  updateUser,
  getUser,
  createUser,
  getMe,
};
