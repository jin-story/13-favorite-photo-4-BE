import prisma from "../../config/prisma.js";

async function findById(id) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function findByNickname(nickname) {
  return await prisma.user.findUnique({
    where: {
      nickname,
    },
  });
}

async function save(user) {
  return await prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      encryptedPassword: user.encryptedPassword,
      provider: user.provider,
      providerId: user.providerId,
    },
  });
}

async function update(id, data) {
  return await prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

async function findInventoriesForSummaryByUserId(userId) {
  return await prisma.userInventory.findMany({
    where: {
      userId,
      ownedQuantity: {
        gt: 0,
      },
    },
    select: {
      ownedQuantity: true,
      photoCard: {
        select: {
          grade: true,
        },
      },
    },
  });
}

async function findInventoriesByUserId(
  userId,
  { keyword, grade, genre, cursor, limit = 15 } = {},
) {
  const photoCardWhere = {};

  if (keyword) {
    photoCardWhere.name = {
      contains: keyword,
      mode: "insensitive",
    };
  }

  if (grade) {
    photoCardWhere.grade = grade;
  }

  if (genre) {
    photoCardWhere.genre = genre;
  }

  const query = {
    where: {
      userId,
      ownedQuantity: {
        gt: 0,
      },
      photoCard: {
        is: photoCardWhere,
      },
    },
    select: {
      id: true,
      photoCardId: true,
      ownedQuantity: true,
      photoCard: {
        select: {
          id: true,
          name: true,
          grade: true,
          genre: true,
          minPrice: true,
          imageUrl: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    take: limit + 1,
  };

  if (cursor) {
    query.cursor = {
      id: cursor,
    };
    query.skip = 1;
  }

  return prisma.userInventory.findMany(query);
}

async function findExchangeProposalsByProposerId(userId) {
  return prisma.exchangeProposal.findMany({
    where: {
      proposerId: userId,
    },
    select: {
      id: true,
      marketPostingId: true,
      message: true,
      status: true,
      createdAt: true,
      offeredInventory: {
        select: {
          photoCard: {
            select: {
              id: true,
              name: true,
              grade: true,
              genre: true,
              minPrice: true,
              imageUrl: true,
              creator: {
                select: {
                  nickname: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findMarketPostingsBySellerId(userId) {
  return prisma.marketPosting.findMany({
    where: {
      sellerId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      price: true,
      quantity: true,
      remainingQuantity: true,
      status: true,
      createdAt: true,
      userInventory: {
        select: {
          id: true,
          ownedQuantity: true,
          photoCard: {
            select: {
              id: true,
              name: true,
              grade: true,
              genre: true,
              minPrice: true,
              imageUrl: true,
              creator: {
                select: {
                  nickname: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  });
}

async function findNotificationsByUserId(userId) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      type: true,
      message: true,
      isRead: true,
      readAt: true,
      createdAt: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  });
}

async function findNotificationById(notificationId) {
  return prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    select: {
      id: true,
      userId: true,
      type: true,
      message: true,
      isRead: true,
      readAt: true,
      createdAt: true,
    },
  });
}

async function updateNotificationAsRead(notificationId) {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    select: {
      id: true,
      type: true,
      message: true,
      isRead: true,
      readAt: true,
      createdAt: true,
    },
  });
}

export default {
  findById,
  findByEmail,
  findByNickname,
  save,
  update,
  findInventoriesByUserId,
  findInventoriesForSummaryByUserId,
  findExchangeProposalsByProposerId,
  findMarketPostingsBySellerId,
  findNotificationsByUserId,
  findNotificationById,
  updateNotificationAsRead,
};
