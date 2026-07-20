import * as photoCardRepository from "./photo-card.repository.js";

function toPhotoCardResponse(photoCard, ownedQuantity) {
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
    ...(ownedQuantity !== undefined ? { ownedQuantity } : {}),
    createdAt: photoCard.createdAt,
    updatedAt: photoCard.updatedAt,
  };
}

function buildPhotoCardWhere(query) {
  return {
    ...(query.keyword
      ? {
          name: {
            contains: query.keyword,
            mode: "insensitive",
          },
        }
      : {}),
    ...(query.grade ? { grade: query.grade } : {}),
    ...(query.genre ? { genre: query.genre } : {}),
    ...(query.soldOut !== undefined
      ? {
          userInventories: query.soldOut
            ? { none: { ownedQuantity: { gt: 0 } } }
            : { some: { ownedQuantity: { gt: 0 } } },
        }
      : {}),
  };
}

export async function createPhotoCard(creatorId, payload) {
  const photoCard = await photoCardRepository.createPhotoCard({
    creatorId,
    data: payload,
  });

  return toPhotoCardResponse(photoCard);
}

export async function listMyPhotoCards(userId, query) {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const take = limit;
  const result = await photoCardRepository.listMyPhotoCards({
    userId,
    where: buildPhotoCardWhere(query),
    skip,
    take,
  });

  return {
    list: result.list.map((inventory) =>
      toPhotoCardResponse(inventory.photoCard, inventory.ownedQuantity),
    ),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
