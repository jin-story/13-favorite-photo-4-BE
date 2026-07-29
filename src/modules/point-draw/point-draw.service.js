import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";

import prisma from "../../config/prisma.js";
import pointDrawRepository from "./point-draw.repository.js";

const DEFAULT_POINT_DRAW_INTERVAL_MINUTES = 60;

const parsedIntervalMinutes = Number(process.env.POINT_DRAW_INTERVAL_MINUTES);

const POINT_DRAW_INTERVAL_MINUTES =
  Number.isInteger(parsedIntervalMinutes) && parsedIntervalMinutes > 0
    ? parsedIntervalMinutes
    : DEFAULT_POINT_DRAW_INTERVAL_MINUTES;

const POINT_DRAW_INTERVAL_MS = POINT_DRAW_INTERVAL_MINUTES * 60 * 1000;

const POINT_DRAW_REWARDS = [
  { point: 100, weight: 50 },
  { point: 300, weight: 30 },
  { point: 500, weight: 15 },
  { point: 1000, weight: 5 },
];

const MAX_TRANSACTION_RETRIES = 3;

function getRandomPoint() {
  const totalWeight = POINT_DRAW_REWARDS.reduce(
    (sum, reward) => sum + reward.weight,
    0,
  );

  const randomNumber = randomInt(totalWeight);

  let accumulatedWeight = 0;

  for (const reward of POINT_DRAW_REWARDS) {
    accumulatedWeight += reward.weight;

    if (randomNumber < accumulatedWeight) {
      return reward.point;
    }
  }

  throw new Error("포인트 보상 설정이 올바르지 않습니다.");
}

function calculateDrawStatus(createdAt) {
  const nextAvailableAt = new Date(
    createdAt.getTime() + POINT_DRAW_INTERVAL_MS,
  );

  const remainingMilliseconds = nextAvailableAt.getTime() - Date.now();

  const remainingSeconds = Math.max(Math.ceil(remainingMilliseconds / 1000), 0);

  return {
    canDraw: remainingMilliseconds <= 0,
    nextAvailableAt,
    remainingSeconds,
  };
}

function createDrawUnavailableError() {
  const error = new Error("아직 포인트를 다시 뽑을 수 없습니다.");

  error.status = 409;
  error.code = "POINT_DRAW_NOT_AVAILABLE";

  return error;
}

function createDrawConflictError() {
  const error = new Error(
    "포인트 뽑기 처리 중 충돌이 발생했습니다. 다시 시도해 주세요.",
  );

  error.status = 409;
  error.code = "POINT_DRAW_CONFLICT";

  return error;
}

async function getDrawStatus(userId) {
  const latestPointDraw = await pointDrawRepository.findLatestByUserId(userId);

  if (!latestPointDraw) {
    return {
      canDraw: true,
      nextAvailableAt: null,
      remainingSeconds: 0,
    };
  }

  return calculateDrawStatus(latestPointDraw.createdAt);
}

async function executeDrawTransaction(userId) {
  return prisma.$transaction(
    async (tx) => {
      const latestPointDraw =
        await pointDrawRepository.findLatestByUserIdWithTransaction(tx, userId);

      if (latestPointDraw) {
        const currentDrawStatus = calculateDrawStatus(
          latestPointDraw.createdAt,
        );

        if (!currentDrawStatus.canDraw) {
          throw createDrawUnavailableError();
        }
      }

      const point = getRandomPoint();

      const pointDraw = await pointDrawRepository.createWithTransaction(tx, {
        userId,
        point,
      });

      const updatedUser =
        await pointDrawRepository.incrementUserPointsWithTransaction(tx, {
          userId,
          point,
        });

      const nextDrawStatus = calculateDrawStatus(pointDraw.createdAt);

      return {
        point: pointDraw.point,
        totalPoints: updatedUser.points,
        canDraw: nextDrawStatus.canDraw,
        nextAvailableAt: nextDrawStatus.nextAvailableAt,
        remainingSeconds: nextDrawStatus.remainingSeconds,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

async function drawPoint(userId) {
  let retries = 0;

  while (retries < MAX_TRANSACTION_RETRIES) {
    try {
      return await executeDrawTransaction(userId);
    } catch (error) {
      if (error.code !== "P2034") {
        throw error;
      }

      retries += 1;
    }
  }

  throw createDrawConflictError();
}

export default {
  getDrawStatus,
  drawPoint,
};
