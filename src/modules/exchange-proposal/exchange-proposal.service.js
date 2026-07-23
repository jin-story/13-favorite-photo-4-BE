import exchangeProposalRepository from "./exchange-proposal.repository.js";

async function createExchangeProposal(proposerId, marketPostingId, payload) {
  const posting = await exchangeProposalRepository.findMarketPostingById(
    marketPostingId,
  );

  if (!posting) {
    const error = new Error("판매글을 찾을 수 없습니다.");
    error.status = 404;
    error.code = "MARKET_POSTING_NOT_FOUND";
    throw error;
  }

  if (posting.sellerId === proposerId) {
    const error = new Error("본인의 판매글에는 교환을 제안할 수 없습니다.");
    error.status = 409;
    error.code = "CANNOT_PROPOSE_OWN_MARKET_POSTING";
    throw error;
  }

  if (posting.status !== "ON_SALE" || posting.remainingQuantity < 1) {
    const error = new Error("교환을 제안할 수 없는 판매글입니다.");
    error.status = 409;
    error.code = "MARKET_POSTING_NOT_EXCHANGEABLE";
    throw error;
  }

  const offeredInventory =
    await exchangeProposalRepository.findOfferedInventoryById(
      payload.offeredInventoryId,
      proposerId,
    );

  if (!offeredInventory) {
    const error = new Error("교환 가능한 보유 포토카드를 찾을 수 없습니다.");
    error.status = 404;
    error.code = "USER_INVENTORY_NOT_FOUND";
    throw error;
  }

  return exchangeProposalRepository.createExchangeProposal({
    proposerId,
    marketPostingId,
    data: payload,
  });
}

async function listExchangeProposals(sellerId, marketPostingId) {
  const posting = await exchangeProposalRepository.findMarketPostingById(
    marketPostingId,
  );

  if (!posting) {
    const error = new Error("판매글을 찾을 수 없습니다.");
    error.status = 404;
    error.code = "MARKET_POSTING_NOT_FOUND";
    throw error;
  }

  if (posting.sellerId !== sellerId) {
    const error = new Error("판매자 본인만 교환 제안을 조회할 수 있습니다.");
    error.status = 403;
    error.code = "FORBIDDEN_EXCHANGE_PROPOSAL";
    throw error;
  }

  return exchangeProposalRepository.findExchangeProposalsByMarketPostingId(
    marketPostingId,
  );
}

async function updateExchangeProposal(userId, exchangeProposalId, status) {
  const proposal = await exchangeProposalRepository.findExchangeProposalById(
    exchangeProposalId,
  );

  if (!proposal) {
    const error = new Error("교환 제안을 찾을 수 없습니다.");
    error.status = 404;
    error.code = "EXCHANGE_PROPOSAL_NOT_FOUND";
    throw error;
  }

  const isProposer = proposal.proposerId === userId;
  const isSeller = proposal.marketPosting.sellerId === userId;

  if (!isProposer && !isSeller) {
    const error = new Error("교환 제안 상태를 변경할 권한이 없습니다.");
    error.status = 403;
    error.code = "FORBIDDEN_EXCHANGE_PROPOSAL";
    throw error;
  }

  if (proposal.status !== "PENDING") {
    const error = new Error("대기 중인 교환 제안만 상태를 변경할 수 있습니다.");
    error.status = 409;
    error.code = "EXCHANGE_PROPOSAL_NOT_PENDING";
    throw error;
  }

  if (status === "CANCELED" && !isProposer) {
    const error = new Error("제안자 본인만 교환 제안을 취소할 수 있습니다.");
    error.status = 403;
    error.code = "FORBIDDEN_EXCHANGE_PROPOSAL";
    throw error;
  }

  if (
    (status === "APPROVED" || status === "REJECTED") &&
    !isSeller
  ) {
    const error = new Error("판매자 본인만 교환 제안을 승인하거나 거절할 수 있습니다.");
    error.status = 403;
    error.code = "FORBIDDEN_EXCHANGE_PROPOSAL";
    throw error;
  }

  if (status === "APPROVED") {
    if (
      proposal.marketPosting.status !== "ON_SALE" ||
      proposal.marketPosting.deletedAt !== null ||
      proposal.marketPosting.remainingQuantity < 1
    ) {
      const error = new Error("교환할 수 없는 판매글입니다.");
      error.status = 409;
      error.code = "MARKET_POSTING_NOT_EXCHANGEABLE";
      throw error;
    }

    if (proposal.offeredInventory.ownedQuantity < 1) {
      const error = new Error("제안한 포토카드의 보유 수량이 부족합니다.");
      error.status = 409;
      error.code = "INSUFFICIENT_INVENTORY_QUANTITY";
      throw error;
    }

    return exchangeProposalRepository.approveExchangeProposal(proposal);
  }

  return exchangeProposalRepository.updateExchangeProposalStatus(
    exchangeProposalId,
    status,
  );
}

export default {
  createExchangeProposal,
  listExchangeProposals,
  updateExchangeProposal,
};
