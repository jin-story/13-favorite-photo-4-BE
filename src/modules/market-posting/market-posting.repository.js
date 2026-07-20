import prisma from "../../config/prisma.js";

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
      const error = new Error("판매 가능한 보유 포토카드를 찾을 수 없습니다.");
      error.status = 404;
      error.code = "USER_INVENTORY_NOT_FOUND";
      throw error;
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
      const error = new Error("판매 등록 가능한 보유 수량이 부족합니다.");
      error.status = 409;
      error.code = "INSUFFICIENT_INVENTORY_QUANTITY";
      throw error;
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
      const error = new Error("판매글을 찾을 수 없습니다.");
      error.status = 404;
      error.code = "MARKET_POSTING_NOT_FOUND";
      throw error;
    }

    if (posting.sellerId !== sellerId) {
      const error = new Error("판매자 본인만 수정할 수 있습니다.");
      error.status = 403;
      error.code = "FORBIDDEN_MARKET_POSTING";
      throw error;
    }

    if (posting.status !== "ON_SALE") {
      const error = new Error("판매 중인 판매글만 수정할 수 있습니다.");
      error.status = 409;
      error.code = "MARKET_POSTING_NOT_EDITABLE";
      throw error;
    }

    const updateData = { ...data };

    if (data.quantity !== undefined && data.quantity !== posting.quantity) {
      const soldQuantity = posting.quantity - posting.remainingQuantity;

      if (data.quantity < soldQuantity) {
        const error = new Error("이미 판매된 수량보다 적게 수정할 수 없습니다.");
        error.status = 409;
        error.code = "INVALID_MARKET_POSTING_QUANTITY";
        throw error;
      }

      const remainingDiff = data.quantity - posting.quantity;

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
          const error = new Error("판매 수량을 늘릴 수 있는 보유 수량이 부족합니다.");
          error.status = 409;
          error.code = "INSUFFICIENT_INVENTORY_QUANTITY";
          throw error;
        }
      } else {
        await tx.userInventory.update({
          where: { id: posting.userInventoryId },
          data: {
            ownedQuantity: {
              increment: Math.abs(remainingDiff),
            },
          },
        });
      }

      updateData.remainingQuantity = data.quantity - soldQuantity;
    }

    await tx.marketPosting.update({
      where: { id },
      data: updateData,
    });

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
      const error = new Error("판매글을 찾을 수 없습니다.");
      error.status = 404;
      error.code = "MARKET_POSTING_NOT_FOUND";
      throw error;
    }

    if (posting.sellerId !== sellerId) {
      const error = new Error("판매자 본인만 취소할 수 있습니다.");
      error.status = 403;
      error.code = "FORBIDDEN_MARKET_POSTING";
      throw error;
    }

    if (posting.status !== "ON_SALE") {
      const error = new Error("판매 중인 판매글만 취소할 수 있습니다.");
      error.status = 409;
      error.code = "MARKET_POSTING_NOT_CANCELABLE";
      throw error;
    }

    const deletedAt = new Date();

    await tx.marketPosting.update({
      where: { id },
      data: { deletedAt },
    });

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
