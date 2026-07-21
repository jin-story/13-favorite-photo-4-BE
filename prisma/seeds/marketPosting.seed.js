import { MarketPostingStatus } from "@prisma/client";

async function seedMarketPostings(tx, photoCards) {
  const marketPostings = photoCards.map((photoCard) => ({
    id: photoCard.id,
    sellerId: photoCard.creatorId,
    userInventoryId: photoCard.id,
    photoCardId: photoCard.id,
    price: photoCard.minPrice,
    quantity: photoCard.totalQuantity,
    remainingQuantity: photoCard.remainingQuantity,
    title: photoCard.name,
    description: photoCard.description,
    status:
      photoCard.remainingQuantity === 0
        ? MarketPostingStatus.SOLD
        : MarketPostingStatus.ON_SALE,
  }));

  const marketPostingData = marketPostings.map((marketPosting) => ({
    id: marketPosting.id,
    sellerId: marketPosting.sellerId,
    userInventoryId: marketPosting.userInventoryId,
    price: marketPosting.price,
    quantity: marketPosting.quantity,
    remainingQuantity: marketPosting.remainingQuantity,
    title: marketPosting.title,
    description: marketPosting.description,
    status: marketPosting.status,
  }));

  const result = await tx.marketPosting.createMany({
    data: marketPostingData,
  });

  return {
    count: result.count,
    items: marketPostings,
  };
}

export { seedMarketPostings };
