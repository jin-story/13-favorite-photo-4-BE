import prisma from "../../config/prisma.js";
import { createHttpError } from "./market-posting.error.js";

const marketPostingInclude = {
  seller: {
    select: {
      id: true,
      nickname: true,
    },
  },
  userInventory: {
    include: {
      photoCard: {
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  },
};

function buildPagination({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createMarketPosting({ sellerId, data }) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.userInventory.findFirst({
      where: {
        id: data.userInventoryId,
        userId: sellerId,
      },
    });

    if (!inventory) {
      throw createHttpError(
        "판매 가능한 보유 포토카드를 찾을 수 없습니다.",
        404,
        "USER_INVENTORY_NOT_FOUND",
      );
    }

    const updatedInventory = await tx.userInventory.updateMany({
      where: {
        id: data.userInventoryId,
        userId: sellerId,
        ownedQuantity: {
          gte: data.quantity,
        },
      },
      data: {
        ownedQuantity: {
          decrement: data.quantity,
        },
      },
    });

    if (updatedInventory.count !== 1) {
      throw createHttpError(
        "판매 등록 가능한 보유 수량이 부족합니다.",
        409,
        "INSUFFICIENT_INVENTORY_QUANTITY",
      );
    }

    return tx.marketPosting.create({
      data: {
        sellerId,
        userInventoryId: data.userInventoryId,
        quantity: data.quantity,
        remainingQuantity: data.quantity,
        price: data.price,
        title: data.title,
        description: data.description,
        exchangeGrade: data.exchangeGrade,
        exchangeGenre: data.exchangeGenre,
        exchangeDescription: data.exchangeDescription,
      },
      include: marketPostingInclude,
    });
  });
}

export async function listMarketPostings({ where, orderBy, skip, take, page, limit }) {
  const [list, total] = await Promise.all([
    prisma.marketPosting.findMany({
      where,
      orderBy,
      skip,
      take,
      include: marketPostingInclude,
    }),
    prisma.marketPosting.count({ where }),
  ]);

  return {
    list,
    pagination: buildPagination({ page, limit, total }),
  };
}

export async function findMarketPostingById(id) {
  return prisma.marketPosting.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: marketPostingInclude,
  });
}

export async function updateMarketPosting({ id, sellerId, data }) {
  return prisma.$transaction(async (tx) => {
    const posting = await tx.marketPosting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!posting) {
      throw createHttpError("판매글을 찾을 수 없습니다.", 404, "MARKET_POSTING_NOT_FOUND");
    }

    if (posting.sellerId !== sellerId) {
      throw createHttpError("판매자 본인만 수정할 수 있습니다.", 403, "FORBIDDEN_MARKET_POSTING");
    }

    if (posting.status !== "ON_SALE") {
      throw createHttpError(
        "판매 중인 판매글만 수정할 수 있습니다.",
        409,
        "MARKET_POSTING_NOT_EDITABLE",
      );
    }

    const updateData = { ...data };
    let remainingDiff = 0;

    if (data.quantity !== undefined && data.quantity !== posting.quantity) {
      const soldQuantity = posting.quantity - posting.remainingQuantity;

      if (data.quantity < soldQuantity) {
        throw createHttpError(
          "이미 판매된 수량보다 적게 수정할 수 없습니다.",
          409,
          "INVALID_MARKET_POSTING_QUANTITY",
        );
      }

      remainingDiff = data.quantity - posting.quantity;
      updateData.remainingQuantity = data.quantity - soldQuantity;
    }

    const updatedPosting = await tx.marketPosting.updateMany({
      where: {
        id,
        sellerId,
        quantity: posting.quantity,
        remainingQuantity: posting.remainingQuantity,
        status: "ON_SALE",
        deletedAt: null,
      },
      data: updateData,
    });

    if (updatedPosting.count !== 1) {
      throw createHttpError(
        "판매 중인 판매글만 수정할 수 있습니다.",
        409,
        "MARKET_POSTING_NOT_EDITABLE",
      );
    }

    if (remainingDiff > 0) {
      const updatedInventory = await tx.userInventory.updateMany({
        where: {
          id: posting.userInventoryId,
          userId: sellerId,
          ownedQuantity: {
            gte: remainingDiff,
          },
        },
        data: {
          ownedQuantity: {
            decrement: remainingDiff,
          },
        },
      });

      if (updatedInventory.count !== 1) {
        throw createHttpError(
          "판매 수량을 늘릴 수 있는 보유 수량이 부족합니다.",
          409,
          "INSUFFICIENT_INVENTORY_QUANTITY",
        );
      }
    } else if (remainingDiff < 0) {
      await tx.userInventory.update({
        where: { id: posting.userInventoryId },
        data: {
          ownedQuantity: {
            increment: Math.abs(remainingDiff),
          },
        },
      });
    }

    return tx.marketPosting.findUnique({
      where: { id },
      include: marketPostingInclude,
    });
  });
}

export async function cancelMarketPosting({ id, sellerId }) {
  return prisma.$transaction(async (tx) => {
    const posting = await tx.marketPosting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!posting) {
      throw createHttpError("판매글을 찾을 수 없습니다.", 404, "MARKET_POSTING_NOT_FOUND");
    }

    if (posting.sellerId !== sellerId) {
      throw createHttpError("판매자 본인만 취소할 수 있습니다.", 403, "FORBIDDEN_MARKET_POSTING");
    }

    if (posting.status !== "ON_SALE") {
      throw createHttpError(
        "판매 중인 판매글만 취소할 수 있습니다.",
        409,
        "MARKET_POSTING_NOT_CANCELABLE",
      );
    }

    const deletedAt = new Date();

    const canceledPosting = await tx.marketPosting.updateMany({
      where: {
        id,
        sellerId,
        status: "ON_SALE",
        deletedAt: null,
      },
      data: { deletedAt },
    });

    if (canceledPosting.count !== 1) {
      throw createHttpError(
        "판매 중인 판매글만 취소할 수 있습니다.",
        409,
        "MARKET_POSTING_NOT_CANCELABLE",
      );
    }

    if (posting.remainingQuantity > 0) {
      await tx.userInventory.update({
        where: { id: posting.userInventoryId },
        data: {
          ownedQuantity: {
            increment: posting.remainingQuantity,
          },
        },
      });
    }
  });
}
