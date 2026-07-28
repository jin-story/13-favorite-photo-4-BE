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
  };
}

function buildOrderBy(sort) {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "price_asc") return { minPrice: "asc" };
  if (sort === "price_desc") return { minPrice: "desc" };
  return { createdAt: "desc" };
}

async function listMyPhotoCards(userId, query) {
  const { page, limit } = query;
  const result = await photoCardRepository.listMyPhotoCards({
    userId,
    where: buildPhotoCardWhere(query),
    orderBy: buildOrderBy(query.sort),
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    list: result.list.map(({ photoCard, ownedQuantity }) => ({
      ...toPhotoCardResponse(photoCard),
      ownedQuantity,
    })),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export default {
  createPhotoCard,
  listMyPhotoCards,
};
