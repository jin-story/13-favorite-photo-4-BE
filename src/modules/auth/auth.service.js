import jwt from "jsonwebtoken";
import userService from "../user/user.service.js";

async function signup(data) {
  const user = await userService.createUser(data);
  const accessToken = userService.createToken(user);
  const refreshToken = userService.createToken(user, "refreshToken");
  await userService.updateUser(user.id, { refreshToken });
  return { user, accessToken, refreshToken };
}

async function login(email, encryptedPassword) {
  const user = await userService.getUser(email, encryptedPassword);
  const accessToken = userService.createToken(user);
  const refreshToken = userService.createToken(user, "refreshToken");
  await userService.updateUser(user.id, { refreshToken });
  return { user, accessToken, refreshToken };
}

async function refresh(refreshToken) {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const { newAccessToken, newRefreshToken } = await userService.refreshToken(
    payload.userId,
    refreshToken,
  );
  await userService.updateUser(payload.userId, {
    refreshToken: newRefreshToken,
  });
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(userId) {
  await userService.updateUser(userId, { refreshToken: null });
}

export default { signup, login, refresh, logout };
