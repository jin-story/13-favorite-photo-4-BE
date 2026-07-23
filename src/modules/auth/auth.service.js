import jwt from "jsonwebtoken";
import userService from "../user/user.service.js";

async function signup(data) {
  const user = await userService.createUser(data);
  const accessToken = userService.createToken(user);
  const refreshToken = userService.createToken(user, "refreshToken");
  await userService.saveRefreshToken(user.id, refreshToken);
  return { user, accessToken, refreshToken };
}

async function login(email, encryptedPassword) {
  const user = await userService.getUser(email, encryptedPassword);
  const accessToken = userService.createToken(user);
  const refreshToken = userService.createToken(user, "refreshToken");
  await userService.saveRefreshToken(user.id, refreshToken);
  return { user, accessToken, refreshToken };
}

async function oauthLogin(user) {
  const accessToken = userService.createToken(user);
  const refreshToken = userService.createToken(user, "refreshToken");
  await userService.saveRefreshToken(user.id, refreshToken);
  return { user, accessToken, refreshToken };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    const authError = new Error("유효하지 않은 토큰입니다.");
    authError.status = 401;
    throw authError;
  }

  const { newAccessToken, newRefreshToken } = await userService.refreshToken(
    payload.userId,
    refreshToken,
  );
  await userService.saveRefreshToken(payload.userId, newRefreshToken);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(userId) {
  await userService.updateUser(userId, { refreshToken: null });
}

export default { signup, login, oauthLogin, refresh, logout };
