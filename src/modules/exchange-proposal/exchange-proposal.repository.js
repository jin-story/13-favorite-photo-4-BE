import prisma from "../../config/prisma.js";

const exchangeProposalSummarySelect = {
  id: true,
  message: true,
  status: true,
  createdAt: true,
  offeredInventory: {
    select: {
      photoCard: {
        select: {
          id: true,
          name: true,
          grade: true,
          genre: true,
          minPrice: true,
          imageUrl: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
  },
};

async function findMarketPostingById(marketPostingId) {
  return prisma.marketPosting.findFirst({
    where: {
      id: marketPostingId,
      deletedAt: null,
    },
    select: {
      id: true,
      sellerId: true,
      status: true,
      remainingQuantity: true,
    },
  });
}

async function findOfferedInventoryById(offeredInventoryId, proposerId) {
  return prisma.userInventory.findFirst({
    where: {
      id: offeredInventoryId,
      userId: proposerId,
      ownedQuantity: {
        gt: 0,
      },
    },
    select: {
      id: true,
    },
  });
}

async function createExchangeProposal({
  proposerId,
  sellerId,
  marketPostingId,
  data,
}) {
  return prisma.$transaction(async (tx) => {
    const exchangeProposal = await tx.exchangeProposal.create({
      data: {
        marketPostingId,
        proposerId,
        offeredInventoryId: data.offeredInventoryId,
        message: data.message,
      },
      select: exchangeProposalSummarySelect,
    });

    const notification = await tx.notification.create({
      data: {
        userId: sellerId,
        marketPostingId,
        exchangeProposalId: exchangeProposal.id,
        type: "EXCHANGE_PROPOSAL_RECEIVED",
        message: "판매 중인 포토카드에 새로운 교환 제안이 도착했습니다.",
      },
    });

    return { exchangeProposal, notification };
  });
}

async function findExchangeProposalsByMarketPostingId(marketPostingId) {
  return prisma.exchangeProposal.findMany({
    where: {
      marketPostingId,
    },
    select: exchangeProposalSummarySelect,
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findExchangeProposalById(exchangeProposalId) {
  return prisma.exchangeProposal.findUnique({
    where: {
      id: exchangeProposalId,
    },
    select: {
      id: true,
      marketPostingId: true,
      proposerId: true,
      offeredInventoryId: true,
      status: true,
      marketPosting: {
        select: {
          sellerId: true,
          status: true,
          deletedAt: true,
          remainingQuantity: true,
          userInventory: {
            select: {
              photoCardId: true,
            },
          },
        },
      },
      offeredInventory: {
        select: {
          photoCardId: true,
          ownedQuantity: true,
        },
      },
    },
  });
}

async function updateExchangeProposalStatus(exchangeProposalId, status) {
  const updatedProposal = await prisma.exchangeProposal.updateMany({
    where: {
      id: exchangeProposalId,
      status: "PENDING",
    },
    data: {
      status,
    },
  });

  if (updatedProposal.count !== 1) {
    const error = new Error(
      "교환 제안 상태가 변경되었습니다. 다시 시도해 주세요.",
    );
    error.status = 409;
    error.code = "EXCHANGE_PROPOSAL_STATUS_CONFLICT";
    throw error;
  }

  return prisma.exchangeProposal.findUnique({
    where: {
      id: exchangeProposalId,
    },
    select: exchangeProposalSummarySelect,
  });
}

// 추가
async function rejectExchangeProposal({
  exchangeProposalId,
  proposerId,
  marketPostingId,
}) {
  return prisma.$transaction(async (tx) => {
    const updatedProposal = await tx.exchangeProposal.updateMany({
      where: {
        id: exchangeProposalId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    });

    if (updatedProposal.count !== 1) {
      const error = new Error(
        "교환 제안 상태가 변경되었습니다. 다시 시도해 주세요.",
      );
      error.status = 409;
      error.code = "EXCHANGE_PROPOSAL_STATUS_CONFLICT";
      throw error;
    }

    const notification = await tx.notification.create({
      data: {
        userId: proposerId,
        marketPostingId,
        exchangeProposalId,
        type: "EXCHANGE_PROPOSAL_REJECTED",
        message: "교환 제안이 거절되었습니다.",
      },
    });

    const exchangeProposal = await tx.exchangeProposal.findUnique({
      where: {
        id: exchangeProposalId,
      },
      select: exchangeProposalSummarySelect,
    });
    return { exchangeProposal, notification };
  });
}

async function approveExchangeProposal(proposal) {
  return prisma.$transaction(async (tx) => {
    const updatedProposal = await tx.exchangeProposal.updateMany({
      where: {
        id: proposal.id,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
      },
    });

    if (updatedProposal.count !== 1) {
      const error = new Error(
        "교환 제안 상태가 변경되었습니다. 다시 시도해 주세요.",
      );
      error.status = 409;
      error.code = "EXCHANGE_PROPOSAL_STATUS_CONFLICT";
      throw error;
    }

    const updatedOfferedInventory = await tx.userInventory.updateMany({
      where: {
        id: proposal.offeredInventoryId,
        userId: proposal.proposerId,
        ownedQuantity: {
          gte: 1,
        },
      },
      data: {
        ownedQuantity: {
          decrement: 1,
        },
      },
    });

    if (updatedOfferedInventory.count !== 1) {
      const error = new Error("제안한 포토카드의 보유 수량이 부족합니다.");
      error.status = 409;
      error.code = "INSUFFICIENT_INVENTORY_QUANTITY";
      throw error;
    }

    const remainingQuantity = proposal.marketPosting.remainingQuantity - 1;
    const updatedPosting = await tx.marketPosting.updateMany({
      where: {
        id: proposal.marketPostingId,
        status: "ON_SALE",
        deletedAt: null,
        remainingQuantity: proposal.marketPosting.remainingQuantity,
      },
      data: {
        remainingQuantity,
        status: remainingQuantity === 0 ? "SOLD" : "ON_SALE",
      },
    });

    if (updatedPosting.count !== 1) {
      const error = new Error(
        "판매 수량이 변경되었습니다. 다시 시도해 주세요.",
      );
      error.status = 409;
      error.code = "MARKET_POSTING_QUANTITY_CONFLICT";
      throw error;
    }

    await tx.userInventory.upsert({
      where: {
        userId_photoCardId: {
          userId: proposal.marketPosting.sellerId,
          photoCardId: proposal.offeredInventory.photoCardId,
        },
      },
      update: {
        ownedQuantity: {
          increment: 1,
        },
      },
      create: {
        userId: proposal.marketPosting.sellerId,
        photoCardId: proposal.offeredInventory.photoCardId,
        ownedQuantity: 1,
      },
    });

    await tx.userInventory.upsert({
      where: {
        userId_photoCardId: {
          userId: proposal.proposerId,
          photoCardId: proposal.marketPosting.userInventory.photoCardId,
        },
      },
      update: {
        ownedQuantity: {
          increment: 1,
        },
      },
      create: {
        userId: proposal.proposerId,
        photoCardId: proposal.marketPosting.userInventory.photoCardId,
        ownedQuantity: 1,
      },
    });

    const notification = await tx.notification.create({
      data: {
        userId: proposal.proposerId,
        marketPostingId: proposal.marketPostingId,
        exchangeProposalId: proposal.id,
        type: "EXCHANGE_PROPOSAL_APPROVED",
        message: "교환 제안이 승인되었습니다.",
      },
    });

    const exchangeProposal = await tx.exchangeProposal.findUnique({
      where: {
        id: proposal.id,
      },
      select: exchangeProposalSummarySelect,
    });
    return { exchangeProposal, notification };
  });
}

export default {
  findMarketPostingById,
  findOfferedInventoryById,
  createExchangeProposal,
  findExchangeProposalsByMarketPostingId,
  findExchangeProposalById,
  updateExchangeProposalStatus,
  approveExchangeProposal,
  rejectExchangeProposal,
};
