import { PHOTO_CARDS } from "../seed-data/photoCard.data.js";

async function seedPhotoCards(tx) {
  const photoCards = PHOTO_CARDS.map((photoCard) => {
    return {
      id: photoCard.id,
      creatorId: photoCard.userId,
      name: photoCard.name,
      grade: photoCard.grade,
      genre: photoCard.genre,
      minPrice: photoCard.price,
      description: photoCard.description,
      imageUrl: photoCard.imageUrl,
      totalQuantity: photoCard.totalQuantity,
      remainingQuantity: photoCard.remainingQuantity,
    };
  });

  const photoCardData = photoCards.map((photoCard) => {
    return {
      id: photoCard.id,
      creatorId: photoCard.creatorId,
      name: photoCard.name,
      grade: photoCard.grade,
      genre: photoCard.genre,
      minPrice: photoCard.minPrice,
      description: photoCard.description,
      imageUrl: photoCard.imageUrl,
      totalQuantity: photoCard.totalQuantity,
    };
  });

  const result = await tx.photoCard.createMany({
    data: photoCardData,
  });

  return {
    count: result.count,
    items: photoCards,
  };
}

export { seedPhotoCards };
