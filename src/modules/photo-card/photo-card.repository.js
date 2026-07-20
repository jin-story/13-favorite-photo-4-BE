import prisma from "../../config/prisma.js";

const photoCardInclude = {
  creator: {
    select: {
      id: true,
      nickname: true,
    },
  },
};

export async function createPhotoCard({ creatorId, data }) {
  return prisma.$transaction(async (tx) => {
    const photoCard = await tx.photoCard.create({
      data: {
        ...data,
        creatorId,
      },
      include: photoCardInclude,
    });

    await tx.userInventory.create({
      data: {
        userId: creatorId,
        photoCardId: photoCard.id,
        ownedQuantity: data.totalQuantity,
      },
    });

    return photoCard;
  });
}

export async function listPhotoCards({ where, orderBy, skip, take }) {
  const [list, total] = await Promise.all([
    prisma.photoCard.findMany({
      where,
      orderBy,
      skip,
      take,
      include: photoCardInclude,
    }),
    prisma.photoCard.count({ where }),
  ]);

  return {
    list,
    total,
  };
}

export async function findPhotoCardById(id) {
  return prisma.photoCard.findUnique({
    where: { id },
    include: photoCardInclude,
  });
}

export async function listMyPhotoCards({ userId, where, skip, take }) {
  const inventoryWhere = {
    userId,
    ownedQuantity: {
      gt: 0,
    },
    photoCard: where,
  };

  const [list, total] = await Promise.all([
    prisma.userInventory.findMany({
      where: inventoryWhere,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      include: {
        photoCard: {
          include: photoCardInclude,
        },
      },
    }),
    prisma.userInventory.count({ where: inventoryWhere }),
  ]);

  return {
    list,
    total,
  };
}
