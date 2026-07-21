import fs from "fs";

import { AuthProvider } from "@prisma/client";
import bcrypt from "bcrypt";

const usersFile = fs.readFileSync(
  "prisma/seed-data/users.json",
  "utf8",
);

const users = JSON.parse(usersFile);

export async function seedUsers(tx) {
  const encryptedUsers = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      encryptedPassword: await bcrypt.hash(user.password, 10),
      provider: AuthProvider.LOCAL,
      points: user.points,
    })),
  );

  const result = await tx.user.createMany({
    data: encryptedUsers,
  });

  return {
    count: result.count,
    items: encryptedUsers,
  };
}
