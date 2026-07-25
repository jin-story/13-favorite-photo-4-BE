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

export async function listMarketPostings({ where, orderBy, cursor, sort, limit }) {
  const isPriceSort = sort.startsWith("price");
  const field = isPriceSort ? "price" : "createdAt";
  const direction = sort === "oldest" || sort === "price_asc" ? "gt" : "lt";
  const cursorWhere = cursor
    ? {
        OR: [
          { [field]: { [direction]: cursor.value } },
          { [field]: cursor.value, id: { [direction]: cursor.id } },
        ],
      }
    : {};

  return prisma.marketPosting.findMany({
    where: { AND: [where, cursorWhere] },
    orderBy,
    take: limit + 1,
    include: marketPostingInclude,
  });
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

export async function purchaseMarketPosting({ buyerId, marketPostingId, quantity }) {
  return prisma.$transaction(async (tx) => {
    const posting = await tx.marketPosting.findFirst({
      where: {
        id: marketPostingId,
        deletedAt: null,
      },
      include: {
        userInventory: {
          select: {
            photoCardId: true,
          },
        },
      },
    });

    if (!posting) {
      throw createHttpError("판매글을 찾을 수 없습니다.", 404, "MARKET_POSTING_NOT_FOUND");
    }

    if (posting.sellerId === buyerId) {
      throw createHttpError(
        "본인의 판매글은 구매할 수 없습니다.",
        409,
        "CANNOT_PURCHASE_OWN_MARKET_POSTING",
      );
    }

    if (posting.status !== "ON_SALE" || posting.remainingQuantity < quantity) {
      throw createHttpError(
        "구매 가능한 판매 수량이 부족합니다.",
        409,
        "INSUFFICIENT_MARKET_POSTING_QUANTITY",
      );
    }

    const totalPrice = posting.price * quantity;
    const updatedBuyer = await tx.user.updateMany({
      where: {
        id: buyerId,
        points: {
          gte: totalPrice,
        },
      },
      data: {
        points: {
          decrement: totalPrice,
        },
      },
    });

    if (updatedBuyer.count !== 1) {
      throw createHttpError("보유 포인트가 부족합니다.", 409, "INSUFFICIENT_POINTS");
    }

    const remainingQuantity = posting.remainingQuantity - quantity;
    const updatedPosting = await tx.marketPosting.updateMany({
      where: {
        id: marketPostingId,
        status: "ON_SALE",
        deletedAt: null,
        remainingQuantity: posting.remainingQuantity,
      },
      data: {
        remainingQuantity,
        status: remainingQuantity === 0 ? "SOLD" : "ON_SALE",
      },
    });

    if (updatedPosting.count !== 1) {
      throw createHttpError(
        "판매 수량이 변경되었습니다. 다시 시도해 주세요.",
        409,
        "MARKET_POSTING_QUANTITY_CONFLICT",
      );
    }

    await tx.user.update({
      where: { id: posting.sellerId },
      data: {
        points: {
          increment: totalPrice,
        },
      },
    });

    await tx.userInventory.upsert({
      where: {
        userId_photoCardId: {
          userId: buyerId,
          photoCardId: posting.userInventory.photoCardId,
        },
      },
      update: {
        ownedQuantity: {
          increment: quantity,
        },
      },
      create: {
        userId: buyerId,
        photoCardId: posting.userInventory.photoCardId,
        ownedQuantity: quantity,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        marketPostingId,
        buyerId,
        sellerId: posting.sellerId,
        photoCardId: posting.userInventory.photoCardId,
        transactionPrice: posting.price,
        quantity,
      },
    });

    const notifications = [
      {
        userId: buyerId,
        marketPostingId,
        transactionId: transaction.id,
        type: "TRANSACTION_COMPLETED",
        message: "포토카드 구매가 완료되었습니다.",
      },
      {
        userId: posting.sellerId,
        marketPostingId,
        transactionId: transaction.id,
        type: remainingQuantity === 0 ? "MARKET_POSTING_SOLD_OUT" : "MARKET_POSTING_SOLD",
        message:
          remainingQuantity === 0
            ? "판매 중인 포토카드가 품절되었습니다."
            : "판매 중인 포토카드가 판매되었습니다.",
      },
    ];

    await tx.notification.createMany({ data: notifications });

    return {
      ...transaction,
      totalPrice,
      remainingQuantity,
    };
  });
}
