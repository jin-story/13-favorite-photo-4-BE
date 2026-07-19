import userService from "./user.service.js";

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

//express 5
async function getMyInventories(req, res) {
  const inventories = await userService.getMyInventories(req.user.userId);

  return res.status(200).json(inventories);
}

export default {
  getMe,
  getMyInventories,
};
