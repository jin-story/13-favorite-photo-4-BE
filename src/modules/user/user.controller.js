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

export default {
  getMe,
  getMyInventories,
  getMyExchangeProposals,
  getMyMarketPostings,
};
