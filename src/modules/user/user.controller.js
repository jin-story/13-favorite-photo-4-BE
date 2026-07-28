import {
  getMyInventoriesQuerySchema,
  inventoryIdParamsSchema,
  markNotificationAsReadParamsSchema,
} from "./user.schema.js";
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
  //나중에 통합하면 지우기
  const filters = getMyInventoriesQuerySchema.parse(req.query);

  const inventories = await userService.getMyInventories(
    req.user.userId,
    filters,
  );

  return res.status(200).json(inventories);
}

async function getMyInventory(req, res) {
  const { inventoryId } = inventoryIdParamsSchema.parse(req.params);
  const inventory = await userService.getMyInventory(
    req.user.userId,
    inventoryId,
  );

  return res.status(200).json(inventory);
}

async function getMyPoints(req, res) {
  const points = await userService.getMyPoints(req.user.userId);

  return res.status(200).json(points);
}

async function getMyExchangeProposals(req, res) {
  const exchangeProposals = await userService.getMyExchangeProposals(
    req.user.userId,
  );
  return res.status(200).json(exchangeProposals);
}

async function getMyMarketPostings(req, res) {
  const marketPostings = await userService.getMyMarketPostings(req.user.userId);

  return res.status(200).json(marketPostings);
}

async function getMyNotifications(req, res) {
  const notifications = await userService.getMyNotifications(req.user.userId);

  return res.status(200).json(notifications);
}

async function markNotificationAsRead(req, res) {
  const { notificationId } = markNotificationAsReadParamsSchema.parse(
    req.params,
  );

  const notification = await userService.markNotificationAsRead(
    req.user.userId,
    notificationId,
  );

  return res.status(200).json(notification);
}

export default {
  getMe,
  getMyInventories,
  getMyInventory,
  getMyPoints,
  getMyExchangeProposals,
  getMyMarketPostings,
  getMyNotifications,
  markNotificationAsRead,
};
