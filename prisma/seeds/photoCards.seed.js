import fs from "fs";

const cardsFile = fs.readFileSync(
  "prisma/seed-data/cards.json",
  "utf8",
);

const cards = JSON.parse(cardsFile);

function convertPhotoCard(card) {
  return {
    id: card.id,
    creatorId: card.userId,
    name: card.name,
    grade: card.grade,
    genre: card.genre,
    minPrice: card.price,
    description: card.description,
    imageUrl: card.imageUrl,
    totalQuantity: card.totalQuantity,
    remainingQuantity: card.remainingQuantity,
  };
}

export async function seedPhotoCards(tx) {
  const photoCards = cards.map(convertPhotoCard);

  const photoCardData = photoCards.map((photoCard) => ({
    id: photoCard.id,
    creatorId: photoCard.creatorId,
    name: photoCard.name,
    grade: photoCard.grade,
    genre: photoCard.genre,
    minPrice: photoCard.minPrice,
    description: photoCard.description,
    imageUrl: photoCard.imageUrl,
    totalQuantity: photoCard.totalQuantity,
  }));

  const result = await tx.photoCard.createMany({
    data: photoCardData,
  });

  return {
    count: result.count,
    items: photoCards,
  };
}
