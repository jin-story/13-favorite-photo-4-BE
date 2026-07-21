const POINT_DRAW_VALUES = [
  { point: 100, minutesAgo: 120 },
  { point: 500, minutesAgo: 30 },
  { point: 1000, minutesAgo: 120 },
  { point: 100, minutesAgo: 30 },
  { point: 500, minutesAgo: 120 },
  { point: 1000, minutesAgo: 30 },
  { point: 100, minutesAgo: 120 },
  { point: 500, minutesAgo: 30 },
  { point: 1000, minutesAgo: 120 },
  { point: 100, minutesAgo: 30 },
];

async function seedPointDraws(tx, seedData) {
  const users = seedData.users;
  const seededAt = seedData.seededAt;

  const pointDraws = POINT_DRAW_VALUES.map((pointDraw, index) => ({
    id: index + 1,
    userId: users[index].id,
    point: pointDraw.point,
    createdAt: new Date(
      seededAt.getTime() - pointDraw.minutesAgo * 60 * 1000,
    ),
  }));

  const result = await tx.pointDraw.createMany({
    data: pointDraws,
  });

  return {
    count: result.count,
    items: pointDraws,
  };
}

export { seedPointDraws };
