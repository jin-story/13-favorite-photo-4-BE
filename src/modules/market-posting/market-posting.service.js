import * as marketPostingRepository from "./market-posting.repository.js";
import { createHttpError } from "./market-posting.error.js";

function toPhotoCardResponse(photoCard) {
  if (!photoCard) return undefined;

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

function toMarketPostingResponse(posting) {
  return {
    id: posting.id,
    sellerId: posting.sellerId,
    seller: posting.seller,
    userInventoryId: posting.userInventoryId,
    photoCard: toPhotoCardResponse(posting.userInventory?.photoCard),
    price: posting.price,
    quantity: posting.quantity,
    remainingQuantity: posting.remainingQuantity,
    title: posting.title,
    description: posting.description,
    exchangeGrade: posting.exchangeGrade,
    exchangeGenre: posting.exchangeGenre,
    exchangeDescription: posting.exchangeDescription,
    status: posting.status,
    createdAt: posting.createdAt,
    updatedAt: posting.updatedAt,
  };
}

function buildMarketPostingWhere(query) {
  const photoCardWhere = {
    ...(query.grade ? { grade: query.grade } : {}),
    ...(query.genre ? { genre: query.genre } : {}),
  };

  return {
    deletedAt: null,
    status: "ON_SALE",
    ...(query.keyword
      ? {
          OR: [
            { title: { contains: query.keyword, mode: "insensitive" } },
            { description: { contains: query.keyword, mode: "insensitive" } },
            {
              userInventory: {
                photoCard: {
                  name: { contains: query.keyword, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
    ...(Object.keys(photoCardWhere).length > 0
      ? {
          userInventory: {
            photoCard: {
              ...photoCardWhere,
            },
          },
        }
      : {}),
  };
}

function buildOrderBy(sort) {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "price_asc") return { price: "asc" };
  if (sort === "price_desc") return { price: "desc" };
  return { createdAt: "desc" };
}

async function getExistingMarketPosting(marketPostingId) {
  const posting = await marketPostingRepository.findMarketPostingById(marketPostingId);

  if (!posting) {
    throw createHttpError("판매글을 찾을 수 없습니다.", 404, "MARKET_POSTING_NOT_FOUND");
  }

  return posting;
}

export async function createMarketPosting(sellerId, payload) {
  const posting = await marketPostingRepository.createMarketPosting({
    sellerId,
    data: payload,
  });

  return toMarketPostingResponse(posting);
}

export async function listMarketPostings(query) {
  const page = query.page;
  const limit = query.limit;
  const result = await marketPostingRepository.listMarketPostings({
    where: buildMarketPostingWhere(query),
    orderBy: buildOrderBy(query.sort),
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  });

  return {
    list: result.list.map(toMarketPostingResponse),
    pagination: result.pagination,
  };
}

export async function getMarketPosting(marketPostingId) {
  const posting = await getExistingMarketPosting(marketPostingId);
  return toMarketPostingResponse(posting);
}

export async function updateMarketPosting(sellerId, marketPostingId, payload) {
  const posting = await marketPostingRepository.updateMarketPosting({
    id: marketPostingId,
    sellerId,
    data: payload,
  });

  return toMarketPostingResponse(posting);
}

export async function cancelMarketPosting(sellerId, marketPostingId) {
  await marketPostingRepository.cancelMarketPosting({
    id: marketPostingId,
    sellerId,
  });
}
