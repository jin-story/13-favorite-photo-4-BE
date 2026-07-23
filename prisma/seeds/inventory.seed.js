const PURCHASED_INVENTORIES = [
  { id: 101, userId: 1, photoCardId: 1, ownedQuantity: 3 },
  { id: 102, userId: 1, photoCardId: 2, ownedQuantity: 1 },
  { id: 103, userId: 1, photoCardId: 3, ownedQuantity: 2 },
  { id: 104, userId: 5, photoCardId: 4, ownedQuantity: 1 },
  { id: 105, userId: 6, photoCardId: 7, ownedQuantity: 2 },
  { id: 106, userId: 7, photoCardId: 9, ownedQuantity: 1 },
  { id: 107, userId: 8, photoCardId: 10, ownedQuantity: 1 },
  { id: 108, userId: 9, photoCardId: 11, ownedQuantity: 1 },
  { id: 109, userId: 10, photoCardId: 12, ownedQuantity: 1 },
  { id: 110, userId: 11, photoCardId: 14, ownedQuantity: 1 },
  // userId 1 테스트 데이터 17개 추가
  { id: 111, userId: 1, photoCardId: 4, ownedQuantity: 3 },
  { id: 112, userId: 1, photoCardId: 5, ownedQuantity: 3 },
  { id: 113, userId: 1, photoCardId: 6, ownedQuantity: 3 },
  { id: 114, userId: 1, photoCardId: 7, ownedQuantity: 5 },
  { id: 115, userId: 1, photoCardId: 8, ownedQuantity: 1 },
  { id: 116, userId: 1, photoCardId: 9, ownedQuantity: 1 },
  { id: 117, userId: 1, photoCardId: 10, ownedQuantity: 5 },
  { id: 118, userId: 1, photoCardId: 11, ownedQuantity: 7 },
  { id: 119, userId: 1, photoCardId: 12, ownedQuantity: 1 },
  { id: 120, userId: 1, photoCardId: 13, ownedQuantity: 1 },
  { id: 121, userId: 1, photoCardId: 14, ownedQuantity: 1 },
  { id: 122, userId: 1, photoCardId: 15, ownedQuantity: 1 },
  { id: 123, userId: 1, photoCardId: 16, ownedQuantity: 1 },
  { id: 124, userId: 1, photoCardId: 17, ownedQuantity: 1 },
  { id: 125, userId: 1, photoCardId: 19, ownedQuantity: 1 },
  { id: 126, userId: 1, photoCardId: 20, ownedQuantity: 1 },
  { id: 127, userId: 1, photoCardId: 21, ownedQuantity: 1 },
];

async function seedInventories(tx, photoCards) {
  const sellerInventories = photoCards.map((photoCard) => ({
    id: photoCard.id,
    userId: photoCard.creatorId,
    photoCardId: photoCard.id,
    ownedQuantity: 0,
  }));

  const inventories = [...sellerInventories, ...PURCHASED_INVENTORIES];

  const result = await tx.userInventory.createMany({
    data: inventories,
  });

  return {
    count: result.count,
    items: inventories,
  };
}

export { seedInventories };
