import { PrismaClient } from "@prisma/client";

import { seedExchangeProposals } from "./seeds/exchangeProposal.seed.js";
import { seedInventories } from "./seeds/inventory.seed.js";
import { seedMarketPostings } from "./seeds/marketPosting.seed.js";
import { seedNotifications } from "./seeds/notification.seed.js";
import { seedPhotoCards } from "./seeds/photoCard.seed.js";
import { seedPointDraws } from "./seeds/pointDraw.seed.js";
import { seedTransactions } from "./seeds/transaction.seed.js";
import { seedUsers } from "./seeds/user.seed.js";

const prisma = new PrismaClient();

async function resetDatabase(tx) {
  // 외래키를 참조하는 자식 모델부터 삭제합니다.
  await tx.notification.deleteMany();
  await tx.exchangeProposal.deleteMany();
  await tx.transaction.deleteMany();
  await tx.pointDraw.deleteMany();
  await tx.marketPosting.deleteMany();
  await tx.userInventory.deleteMany();
  await tx.photoCard.deleteMany();
  await tx.user.deleteMany();
}

async function resetSequences(tx) {
  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"users"', 'id'),
             MAX(id),
             true
           )
    FROM "users";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"photo_cards"', 'id'),
             MAX(id),
             true
           )
    FROM "photo_cards";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"user_inventories"', 'id'),
             MAX(id),
             true
           )
    FROM "user_inventories";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"market_postings"', 'id'),
             MAX(id),
             true
           )
    FROM "market_postings";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"point_draws"', 'id'),
             MAX(id),
             true
           )
    FROM "point_draws";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"transactions"', 'id'),
             MAX(id),
             true
           )
    FROM "transactions";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"exchange_proposals"', 'id'),
             MAX(id),
             true
           )
    FROM "exchange_proposals";
  `;

  await tx.$queryRaw`
    SELECT setval(
             pg_get_serial_sequence('"notifications"', 'id'),
             MAX(id),
             true
           )
    FROM "notifications";
  `;
}

async function main() {
  const seededAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await resetDatabase(tx);

    const users = await seedUsers(tx);

    const photoCards = await seedPhotoCards(tx);

    const inventories = await seedInventories(tx, photoCards.items);

    const marketPostings = await seedMarketPostings(tx, photoCards.items);

    const pointDraws = await seedPointDraws(tx, {
      users: users.items,
      seededAt,
    });

    const transactions = await seedTransactions(tx, {
      marketPostings: marketPostings.items,
      seededAt,
    });

    const exchangeProposals = await seedExchangeProposals(tx, {
      marketPostings: marketPostings.items,
      inventories: inventories.items,
      seededAt,
    });

    const notifications = await seedNotifications(tx, {
      transactions: transactions.items,
      exchangeProposals: exchangeProposals.items,
      marketPostings: marketPostings.items,
    });

    await resetSequences(tx);

    return {
      users,
      photoCards,
      inventories,
      marketPostings,
      pointDraws,
      transactions,
      exchangeProposals,
      notifications,
    };
  });

  console.log("시드 데이터 생성 완료");
  console.log(`User: ${result.users.count}개`);
  console.log(`PhotoCard: ${result.photoCards.count}개`);
  console.log(`UserInventory: ${result.inventories.count}개`);
  console.log(`MarketPosting: ${result.marketPostings.count}개`);
  console.log(`PointDraw: ${result.pointDraws.count}개`);
  console.log(`Transaction: ${result.transactions.count}개`);
  console.log(`ExchangeProposal: ${result.exchangeProposals.count}개`);
  console.log(`Notification: ${result.notifications.count}개`);
}

main()
  .catch((error) => {
    console.error("시드 데이터 생성 실패:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
