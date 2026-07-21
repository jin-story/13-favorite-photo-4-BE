import prisma from "../../config/prisma.js";

async function findLatestByUserId(userId) {
  return prisma.pointDraw.findFirst({
    where: {
      userId,
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findLatestByUserIdWithTransaction(tx, userId) {
  return tx.pointDraw.findFirst({
    where: {
      userId,
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function createWithTransaction(tx, { userId, point }) {
  return tx.pointDraw.create({
    data: {
      userId,
      point,
    },
    select: {
      point: true,
      createdAt: true,
    },
  });
}

async function incrementUserPointsWithTransaction(tx, { userId, point }) {
  return tx.user.update({
    where: {
      id: userId,
    },
    data: {
      points: {
        increment: point,
      },
    },
    select: {
      points: true,
    },
  });
}

export default {
  findLatestByUserId,
  findLatestByUserIdWithTransaction,
  createWithTransaction,
  incrementUserPointsWithTransaction,
};
