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

export default {
  createPhotoCard,
};
