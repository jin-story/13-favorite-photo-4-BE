import * as marketPostingService from "./market-posting.service.js";

export async function createMarketPosting(req, res, next) {
  try {
    const posting = await marketPostingService.createMarketPosting(
      req.user.userId,
      req.body,
    );
    res.status(201).json(posting);
  } catch (error) {
    next(error);
  }
}

export async function listMarketPostings(req, res, next) {
  try {
    const postings = await marketPostingService.listMarketPostings(req.query);
    res.status(200).json(postings);
  } catch (error) {
    next(error);
  }
}

export async function getMarketPosting(req, res, next) {
  try {
    const posting = await marketPostingService.getMarketPosting(
      req.user.userId,
      req.params.marketPostingId,
    );
    res.status(200).json(posting);
  } catch (error) {
    next(error);
  }
}

export async function updateMarketPosting(req, res, next) {
  try {
    const posting = await marketPostingService.updateMarketPosting(
      req.user.userId,
      req.params.marketPostingId,
      req.body,
    );
    res.status(200).json(posting);
  } catch (error) {
    next(error);
  }
}

export async function cancelMarketPosting(req, res, next) {
  try {
    await marketPostingService.cancelMarketPosting(
      req.user.userId,
      req.params.marketPostingId,
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function purchaseMarketPosting(req, res, next) {
  try {
    const transaction = await marketPostingService.purchaseMarketPosting(
      req.user.userId,
      req.params.marketPostingId,
      req.body.quantity,
    );
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
}
