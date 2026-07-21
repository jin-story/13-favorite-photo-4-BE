const purchasedInventories = [
  { id: 101, userId: 1, photoCardId: 1, ownedQuantity: 3 },
  { id: 102, userId: 2, photoCardId: 2, ownedQuantity: 1 },
  { id: 103, userId: 3, photoCardId: 3, ownedQuantity: 2 },
  { id: 104, userId: 5, photoCardId: 4, ownedQuantity: 1 },
  { id: 105, userId: 6, photoCardId: 7, ownedQuantity: 2 },
  { id: 106, userId: 7, photoCardId: 9, ownedQuantity: 1 },
  { id: 107, userId: 8, photoCardId: 10, ownedQuantity: 1 },
  { id: 108, userId: 9, photoCardId: 11, ownedQuantity: 1 },
  { id: 109, userId: 10, photoCardId: 12, ownedQuantity: 1 },
  { id: 110, userId: 11, photoCardId: 14, ownedQuantity: 1 },
];

export async function seedInventories(tx, photoCards) {
  const sellerInventories = photoCards.map((photoCard) => ({
    id: photoCard.id,
    userId: photoCard.creatorId,
    photoCardId: photoCard.id,
    ownedQuantity: 0,
  }));

  const inventories = [
    ...sellerInventories,
    ...purchasedInventories,
  ];

  const result = await tx.userInventory.createMany({
    data: inventories,
  });

  return {
    count: result.count,
    items: inventories,
  };
}
