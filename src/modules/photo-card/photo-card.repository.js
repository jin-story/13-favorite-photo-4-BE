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
        creatorId,
        name: data.name,
        grade: data.grade,
        genre: data.genre,
        minPrice: data.minPrice,
        description: data.description,
        imageUrl: data.imageUrl,
        totalQuantity: data.totalQuantity,
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

export async function listMyPhotoCards({ userId, where, orderBy, skip, take }) {
  const inventoryWhere = {
    userId,
    ownedQuantity: {
      gt: 0,
    },
    photoCard: {
      is: where,
    },
  };

  const [list, total] = await Promise.all([
    prisma.userInventory.findMany({
      where: inventoryWhere,
      orderBy: {
        photoCard: orderBy,
      },
      skip,
      take,
      select: {
        ownedQuantity: true,
        photoCard: {
          include: photoCardInclude,
        },
      },
    }),
    prisma.userInventory.count({ where: inventoryWhere }),
  ]);

  return { list, total };
}

export default {
  createPhotoCard,
  listMyPhotoCards,
};
