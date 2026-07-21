import { ExchangeProposalStatus } from "@prisma/client";

const EXCHANGE_PROPOSAL_DATA = [
  {
    id: 1,
    marketPostingId: 12,
    proposerId: 1,
    offeredInventoryId: 101,
    status: ExchangeProposalStatus.PENDING,
  },
  {
    id: 2,
    marketPostingId: 14,
    proposerId: 2,
    offeredInventoryId: 102,
    status: ExchangeProposalStatus.PENDING,
  },
  {
    id: 3,
    marketPostingId: 4,
    proposerId: 3,
    offeredInventoryId: 103,
    status: ExchangeProposalStatus.PENDING,
  },
  {
    id: 4,
    marketPostingId: 37,
    proposerId: 5,
    offeredInventoryId: 104,
    status: ExchangeProposalStatus.PENDING,
  },
  {
    id: 5,
    marketPostingId: 6,
    proposerId: 6,
    offeredInventoryId: 105,
    status: ExchangeProposalStatus.REJECTED,
  },
  {
    id: 6,
    marketPostingId: 53,
    proposerId: 7,
    offeredInventoryId: 106,
    status: ExchangeProposalStatus.REJECTED,
  },
  {
    id: 7,
    marketPostingId: 15,
    proposerId: 8,
    offeredInventoryId: 107,
    status: ExchangeProposalStatus.REJECTED,
  },
  {
    id: 8,
    marketPostingId: 20,
    proposerId: 9,
    offeredInventoryId: 108,
    status: ExchangeProposalStatus.CANCELED,
  },
  {
    id: 9,
    marketPostingId: 26,
    proposerId: 10,
    offeredInventoryId: 109,
    status: ExchangeProposalStatus.CANCELED,
  },
  {
    id: 10,
    marketPostingId: 41,
    proposerId: 11,
    offeredInventoryId: 110,
    status: ExchangeProposalStatus.CANCELED,
  },
];

async function seedExchangeProposals(tx, seedData) {
  const marketPostings = seedData.marketPostings;
  const inventories = seedData.inventories;
  const seededAt = seedData.seededAt;

  const exchangeProposals = EXCHANGE_PROPOSAL_DATA.map(
    (exchangeProposal, index) => {
      const marketPosting = marketPostings.find(
        (item) => item.id === exchangeProposal.marketPostingId,
      );
      const offeredInventory = inventories.find(
        (item) => item.id === exchangeProposal.offeredInventoryId,
      );

      return {
        id: exchangeProposal.id,
        marketPostingId: marketPosting.id,
        proposerId: exchangeProposal.proposerId,
        offeredInventoryId: offeredInventory.id,
        message: `${marketPosting.title} 카드와 교환을 제안합니다.`,
        status: exchangeProposal.status,
        createdAt: new Date(
          seededAt.getTime() - (index + 1) * 2 * 60 * 60 * 1000,
        ),
      };
    },
  );

  const result = await tx.exchangeProposal.createMany({
    data: exchangeProposals,
  });

  return {
    count: result.count,
    items: exchangeProposals,
  };
}

export { seedExchangeProposals };
