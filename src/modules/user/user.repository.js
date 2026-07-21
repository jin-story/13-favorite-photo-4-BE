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

async function findInventoriesByUserId(userId, { keyword, grade, genre } = {}) {
  return prisma.userInventory.findMany({
    where: {
      userId,
      ownedQuantity: {
        gt: 0,
      },
      photoCard: {
        is: {
          ...(keyword && {
            name: {
              contains: keyword,
              mode: "insensitive",
            },
          }),
          ...(grade && { grade }),
          ...(genre && { genre }),
        },
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
  });
}

async function findExchangeProposalsByProposerId(userId) {
  return prisma.exchangeProposal.findMany({
    where: {
      proposerId: userId,
    },
    select: {
      id: true,
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
  findExchangeProposalsByProposerId,
  findMarketPostingsBySellerId,
  findNotificationsByUserId,
  findNotificationById,
  updateNotificationAsRead,
};
