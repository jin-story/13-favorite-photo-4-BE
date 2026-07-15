import authService from "./auth.service.js";
import userService from "../user/user.service.js";

const isProduction = process.env.NODE_ENV === "production";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/auth/refresh-token",
};

async function signup(req, res, next) {
  try {
    const { email, nickname, encryptedPassword } = req.body;
    if (!email || !nickname || !encryptedPassword) {
      const error = new Error("모든 필드를 입력해주세요.");
      error.status = 400;
      throw error;
    }

    const { user, accessToken, refreshToken } = await authService.signup({
      email,
      nickname,
      encryptedPassword,
    });

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, encryptedPassword } = req.body;
    if (!email || !encryptedPassword) {
      const error = new Error("이메일 또는 비밀번호 입력을 확인해주세요.");
      error.status = 400;
      throw error;
    }

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      encryptedPassword,
    );

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const currentRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh(currentRefreshToken);

    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.userId);
    res.clearCookie("refreshToken", { path: "/auth/refresh-token" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export default {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
};
