import { PurchaseStatus } from "@prisma/client";

const transactionData = [
  {
    id: 1,
    marketPostingId: 1,
    buyerId: 1,
    quantity: 3,
  },
  {
    id: 2,
    marketPostingId: 2,
    buyerId: 2,
    quantity: 1,
  },
  {
    id: 3,
    marketPostingId: 3,
    buyerId: 3,
    quantity: 2,
  },
  {
    id: 4,
    marketPostingId: 4,
    buyerId: 5,
    quantity: 1,
  },
  {
    id: 5,
    marketPostingId: 7,
    buyerId: 6,
    quantity: 2,
  },
  {
    id: 6,
    marketPostingId: 9,
    buyerId: 7,
    quantity: 1,
  },
  {
    id: 7,
    marketPostingId: 10,
    buyerId: 8,
    quantity: 1,
  },
  {
    id: 8,
    marketPostingId: 11,
    buyerId: 9,
    quantity: 1,
  },
  {
    id: 9,
    marketPostingId: 12,
    buyerId: 10,
    quantity: 1,
  },
  {
    id: 10,
    marketPostingId: 14,
    buyerId: 11,
    quantity: 1,
  },
];

export async function seedTransactions(
  tx,
  { marketPostings, seededAt },
) {
  const transactions = transactionData.map(
    (transaction, index) => {
      const marketPosting = marketPostings.find(
        (item) =>
          item.id === transaction.marketPostingId,
      );

      if (!marketPosting) {
        throw new Error(
          `거래 대상 판매글을 찾을 수 없습니다. marketPostingId=${transaction.marketPostingId}`,
        );
      }

      return {
        id: transaction.id,
        marketPostingId: marketPosting.id,
        buyerId: transaction.buyerId,
        sellerId: marketPosting.sellerId,
        photoCardId: marketPosting.photoCardId,
        transactionPrice: marketPosting.price,
        quantity: transaction.quantity,
        status: PurchaseStatus.COMPLETED,
        createdAt: new Date(
          seededAt.getTime() -
            (index + 1) * 3 * 60 * 60 * 1000,
        ),
      };
    },
  );

  const result = await tx.transaction.createMany({
    data: transactions,
  });

  return {
    count: result.count,
    items: transactions,
  };
}
