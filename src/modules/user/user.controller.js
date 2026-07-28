import {
  getMyInventoriesQuerySchema,
  markNotificationAsReadParamsSchema,
} from "./user.schema.js";
import userService from "./user.service.js";
import {
  addSubscriber,
  removeSubscriber,
} from "../../common/utils/notificationSubscribers.js";

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

function subscribeNotifications(req, res) {
  const userId = req.user.userId;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  addSubscriber(userId, res);

  res.on("close", () => {
    removeSubscriber(userId, res);
  });
}

export default {
  getMe,
  getMyInventories,
  getMyExchangeProposals,
  getMyMarketPostings,
  getMyNotifications,
  markNotificationAsRead,
  subscribeNotifications,
};
