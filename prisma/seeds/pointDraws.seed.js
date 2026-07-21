const pointDrawData = [
  { id: 1, userId: 1, point: 100, minutesAgo: 120 },
  { id: 2, userId: 2, point: 500, minutesAgo: 30 },
  { id: 3, userId: 3, point: 1000, minutesAgo: 120 },
  { id: 4, userId: 4, point: 100, minutesAgo: 30 },
  { id: 5, userId: 5, point: 500, minutesAgo: 120 },
  { id: 6, userId: 6, point: 1000, minutesAgo: 30 },
  { id: 7, userId: 7, point: 100, minutesAgo: 120 },
  { id: 8, userId: 8, point: 500, minutesAgo: 30 },
  { id: 9, userId: 9, point: 1000, minutesAgo: 120 },
  { id: 10, userId: 10, point: 100, minutesAgo: 30 },
];

export async function seedPointDraws(
  tx,
  { users, seededAt },
) {
  const pointDraws = pointDrawData.map((pointDraw) => ({
    id: pointDraw.id,
    userId: pointDraw.userId,
    point: pointDraw.point,
    createdAt: new Date(
      seededAt.getTime() -
        pointDraw.minutesAgo * 60 * 1000,
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
