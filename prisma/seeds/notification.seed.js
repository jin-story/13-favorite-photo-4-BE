import { NotificationType } from "@prisma/client";

async function seedNotifications(tx, seedData) {
  const transactions = seedData.transactions;
  const exchangeProposals = seedData.exchangeProposals;
  const marketPostings = seedData.marketPostings;

  const transaction1 = transactions.find((item) => item.id === 1);
  const transaction2 = transactions.find((item) => item.id === 2);
  const exchangeProposal1 = exchangeProposals.find((item) => item.id === 1);
  const exchangeProposal5 = exchangeProposals.find((item) => item.id === 5);
  const exchangeProposal6 = exchangeProposals.find((item) => item.id === 6);
  const marketPosting1 = marketPostings.find((item) => item.id === 1);
  const marketPosting2 = marketPostings.find((item) => item.id === 2);
  const marketPosting6 = marketPostings.find((item) => item.id === 6);
  const marketPosting12 = marketPostings.find((item) => item.id === 12);
  const marketPosting53 = marketPostings.find((item) => item.id === 53);

  const notifications = [
    {
      id: 1,
      userId: transaction1.buyerId,
      marketPostingId: transaction1.marketPostingId,
      transactionId: transaction1.id,
      type: NotificationType.TRANSACTION_COMPLETED,
      message: "포토카드 구매가 완료되었습니다.",
      isRead: false,
      readAt: null,
      createdAt: transaction1.createdAt,
    },
    {
      id: 2,
      userId: transaction1.sellerId,
      marketPostingId: transaction1.marketPostingId,
      transactionId: transaction1.id,
      type: NotificationType.MARKET_POSTING_SOLD,
      message: "판매 중인 포토카드가 판매되었습니다.",
      isRead: true,
      readAt: new Date(
        transaction1.createdAt.getTime() + 10 * 60 * 1000,
      ),
      createdAt: transaction1.createdAt,
    },
    {
      id: 3,
      userId: marketPosting1.sellerId,
      marketPostingId: marketPosting1.id,
      transactionId: transaction1.id,
      type: NotificationType.MARKET_POSTING_SOLD_OUT,
      message: "판매 중인 포토카드가 품절되었습니다.",
      isRead: false,
      readAt: null,
      createdAt: transaction1.createdAt,
    },
    {
      id: 4,
      userId: transaction2.buyerId,
      marketPostingId: transaction2.marketPostingId,
      transactionId: transaction2.id,
      type: NotificationType.TRANSACTION_COMPLETED,
      message: "포토카드 구매가 완료되었습니다.",
      isRead: false,
      readAt: null,
      createdAt: transaction2.createdAt,
    },
    {
      id: 5,
      userId: marketPosting2.sellerId,
      marketPostingId: marketPosting2.id,
      transactionId: transaction2.id,
      type: NotificationType.MARKET_POSTING_SOLD_OUT,
      message: "판매 중인 포토카드가 품절되었습니다.",
      isRead: true,
      readAt: new Date(
        transaction2.createdAt.getTime() + 10 * 60 * 1000,
      ),
      createdAt: transaction2.createdAt,
    },
    {
      id: 6,
      userId: marketPosting12.sellerId,
      marketPostingId: marketPosting12.id,
      exchangeProposalId: exchangeProposal1.id,
      type: NotificationType.EXCHANGE_PROPOSAL_RECEIVED,
      message: "새로운 포토카드 교환 제안이 도착했습니다.",
      isRead: false,
      readAt: null,
      createdAt: exchangeProposal1.createdAt,
    },
    {
      id: 7,
      userId: marketPosting6.sellerId,
      marketPostingId: marketPosting6.id,
      exchangeProposalId: exchangeProposal5.id,
      type: NotificationType.EXCHANGE_PROPOSAL_RECEIVED,
      message: "새로운 포토카드 교환 제안이 도착했습니다.",
      isRead: false,
      readAt: null,
      createdAt: exchangeProposal5.createdAt,
    },
    {
      id: 8,
      userId: exchangeProposal5.proposerId,
      marketPostingId: exchangeProposal5.marketPostingId,
      exchangeProposalId: exchangeProposal5.id,
      type: NotificationType.EXCHANGE_PROPOSAL_REJECTED,
      message: "포토카드 교환 제안이 거절되었습니다.",
      isRead: true,
      readAt: new Date(
        exchangeProposal5.createdAt.getTime() + 10 * 60 * 1000,
      ),
      createdAt: exchangeProposal5.createdAt,
    },
    {
      id: 9,
      userId: marketPosting53.sellerId,
      marketPostingId: marketPosting53.id,
      exchangeProposalId: exchangeProposal6.id,
      type: NotificationType.EXCHANGE_PROPOSAL_RECEIVED,
      message: "새로운 포토카드 교환 제안이 도착했습니다.",
      isRead: false,
      readAt: null,
      createdAt: exchangeProposal6.createdAt,
    },
    {
      id: 10,
      userId: exchangeProposal6.proposerId,
      marketPostingId: exchangeProposal6.marketPostingId,
      exchangeProposalId: exchangeProposal6.id,
      type: NotificationType.EXCHANGE_PROPOSAL_REJECTED,
      message: "포토카드 교환 제안이 거절되었습니다.",
      isRead: false,
      readAt: null,
      createdAt: exchangeProposal6.createdAt,
    },
  ];

  const result = await tx.notification.createMany({
    data: notifications,
  });

  return {
    count: result.count,
    items: notifications,
  };
}

export { seedNotifications };
