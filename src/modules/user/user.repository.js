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

async function findInventoriesByUserId(userId) {
  return prisma.userInventory.findMany({
    where: { userId, ownedQuantity: { gt: 0 } },
    include: { photoCard: true },
  });
}

export default {
  findById,
  findByEmail,
  findByNickname,
  save,
  update,
  findInventoriesByUserId,
};
