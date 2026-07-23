import exchangeProposalService from "./exchange-proposal.service.js";

async function createExchangeProposal(req, res) {
  const exchangeProposal = await exchangeProposalService.createExchangeProposal(
    req.user.userId,
    req.params.marketPostingId,
    req.body,
  );

  return res.status(201).json(exchangeProposal);
}

async function listExchangeProposals(req, res) {
  const exchangeProposals = await exchangeProposalService.listExchangeProposals(
    req.user.userId,
    req.params.marketPostingId,
  );

  return res.status(200).json(exchangeProposals);
}

async function updateExchangeProposal(req, res) {
  const exchangeProposal = await exchangeProposalService.updateExchangeProposal(
    req.user.userId,
    req.params.exchangeProposalId,
    req.body.status,
  );

  return res.status(200).json(exchangeProposal);
}

export default {
  createExchangeProposal,
  listExchangeProposals,
  updateExchangeProposal,
};
