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

function buildOrderBy(sort) {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "price_asc") return { minPrice: "asc" };
  if (sort === "price_desc") return { minPrice: "desc" };
  return { createdAt: "desc" };
}

export async function createPhotoCard(creatorId, payload) {
  const photoCard = await photoCardRepository.createPhotoCard({
    creatorId,
    data: payload,
  });

  return toPhotoCardResponse(photoCard);
}

export async function listPhotoCards(query) {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const take = limit;
  const result = await photoCardRepository.listPhotoCards({
    where: buildPhotoCardWhere(query),
    orderBy: buildOrderBy(query.sort),
    skip,
    take,
  });

  return {
    list: result.list.map((photoCard) => toPhotoCardResponse(photoCard)),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function getPhotoCard(photoCardId) {
  const photoCard = await photoCardRepository.findPhotoCardById(photoCardId);

  if (!photoCard) {
    const error = new Error("포토카드를 찾을 수 없습니다.");
    error.status = 404;
    error.code = "PHOTO_CARD_NOT_FOUND";
    throw error;
  }

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
