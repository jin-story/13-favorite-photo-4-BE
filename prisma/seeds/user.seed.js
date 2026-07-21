import { AuthProvider } from "@prisma/client";
import bcrypt from "bcrypt";

import { USERS } from "../seed-data/user.data.js";

async function seedUsers(tx) {
  const users = await Promise.all(
    USERS.map(async (user) => {
      const encryptedPassword = await bcrypt.hash(user.password, 10);

      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        encryptedPassword,
        provider: AuthProvider.LOCAL,
        points: user.points,
      };
    }),
  );

  const result = await tx.user.createMany({
    data: users,
  });

  return {
    count: result.count,
    items: users,
  };
}

export { seedUsers };
