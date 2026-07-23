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
    error.status = 401;
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
  const isValid =
    user?.refreshToken &&
    (await bcrypt.compare(refreshToken, user.refreshToken));
  if (!isValid) {
    const error = new Error("접근 권한이 없습니다.");
    error.status = 403;
    throw error;
  }
  const newAccessToken = createToken(user);
  const newRefreshToken = createToken(user, "refreshToken");
  return { newAccessToken, newRefreshToken };
}

async function saveRefreshToken(userId, token) {
  const hashed = await bcrypt.hash(token, 10);
  return userRepository.update(userId, { refreshToken: hashed });
}

function filterSensitiveUserData(user) {
  const { encryptedPassword, refreshToken, ...rest } = user;
  return rest;
}

async function createUser(user) {
  const hasUser = await userRepository.findByEmail(user.email);
  if (hasUser) {
    const error = new Error("이미 존재하는 사용자입니다.");
    error.status = 409;
    error.data = { email: user.email };
    throw error;
  }
  const hasNickname = await userRepository.findByNickname(user.nickname);
  if (hasNickname) {
    const error = new Error("이미 사용 중인 닉네임입니다.");
    error.status = 409;
    error.data = { nickname: user.nickname };
    throw error;
  }
  const hashed = await hashedPassword(user.encryptedPassword);
  const createdUser = await userRepository.save({
    ...user,
    encryptedPassword: hashed,
  });
  return filterSensitiveUserData(createdUser);
}

async function getUser(email, inputPassword) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("존재하지 않는 이메일입니다.");
    error.status = 401;
    throw error;
  }
  await verifyPassword(inputPassword, user.encryptedPassword);
  return filterSensitiveUserData(user);
}

async function updateUser(id, data) {
  const updateUser = await userRepository.update(id, data);
  return filterSensitiveUserData(updateUser);
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("존재하지 않는 유저입니다");
    error.status = 404;
    throw error;
  }
  return filterSensitiveUserData(user);
}

async function getMyInventories(userId, filters) {
  return userRepository.findInventoriesByUserId(userId, filters);
}

async function getMyExchangeProposals(userId) {
  return userRepository.findExchangeProposalsByProposerId(userId);
}

async function getMyMarketPostings(userId) {
  return userRepository.findMarketPostingsBySellerId(userId);
}

async function getMyNotifications(userId) {
  return userRepository.findNotificationsByUserId(userId);
}

function toNotificationResponse(notification) {
  const { userId, ...notificationResponse } = notification;

  return notificationResponse;
}

async function markNotificationAsRead(userId, notificationId) {
  const notification =
    await userRepository.findNotificationById(notificationId);

  if (!notification) {
    const error = new Error("알림을 찾을 수 없습니다.");
    error.status = 404;
    error.code = "NOTIFICATION_NOT_FOUND";
    throw error;
  }

  if (notification.userId !== userId) {
    const error = new Error("해당 알림을 수정할 권한이 없습니다.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (notification.isRead) {
    return toNotificationResponse(notification);
  }

  return userRepository.updateNotificationAsRead(notificationId);
}

async function oauthCreateOrUpdate(provider, providerId, email, name) {
  const isExistUser = await userRepository.findByEmail(email);
  if (isExistUser) {
    const updatedUser = await userRepository.update(isExistUser.id, {
      provider,
      providerId,
    });
    return filterSensitiveUserData(updatedUser);
  }

  const createdUser = await userRepository.save({
    email,
    nickname: name,
    provider,
    providerId,
  });
  return filterSensitiveUserData(createdUser);
}

export default {
  createToken,
  refreshToken,
  saveRefreshToken,
  updateUser,
  getUser,
  createUser,
  getMe,
  getMyInventories,
  getMyExchangeProposals,
  getMyMarketPostings,
  getMyNotifications,
  markNotificationAsRead,
  oauthCreateOrUpdate,
};
