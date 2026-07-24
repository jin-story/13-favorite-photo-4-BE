import photoCardRepository from "./photo-card.repository.js";

function toPhotoCardResponse(photoCard) {
  return {
    id: photoCard.id,
    creatorId: photoCard.creatorId,
    creator: photoCard.creator,
    name: photoCard.name,
    grade: photoCard.grade,
    genre: photoCard.genre,
    minPrice: photoCard.minPrice,
    description: photoCard.description,
    imageUrl: photoCard.imageUrl,
    totalQuantity: photoCard.totalQuantity,
    createdAt: photoCard.createdAt,
    updatedAt: photoCard.updatedAt,
  };
}

async function createPhotoCard(creatorId, payload) {
  const photoCard = await photoCardRepository.createPhotoCard({
    creatorId,
    data: payload,
  });

  return toPhotoCardResponse(photoCard);
}

export default {
  createPhotoCard,
};
