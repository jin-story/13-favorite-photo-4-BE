import userService from "./user.service.js";

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export default {
  getMe,
};
