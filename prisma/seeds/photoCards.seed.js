import fs from "fs";

import { Grade, Genre } from "@prisma/client";

const cards = JSON.parse(
  fs.readFileSync("prisma/seed-data/cards.json", "utf8"),
);

const gradeMap = {
  common: Grade.COMMON,
  rare: Grade.RARE,
  "super rare": Grade.SUPER_RARE,
  legendary: Grade.LEGENDARY,
};

const genreMap = {
  앨범: Genre.ALBUM,
  특전: Genre.SPECIAL,
  팬싸: Genre.FAN_SIGN,
  시즌그리팅: Genre.SEASON_GREETING,
  팬미팅: Genre.FAN_MEETING,
  콘서트: Genre.CONCERT,
  MD: Genre.MD,
  콜라보: Genre.COLLABORATION,
  팬클럽: Genre.FAN_CLUB,
  기타: Genre.ETC,
};

function convertPhotoCard(card) {
  const grade = gradeMap[card.grade];
  const genre = genreMap[card.genre];

  if (!grade) {
    throw new Error(
      `지원하지 않는 카드 등급입니다. cardId=${card.id}, grade=${card.grade}`,
    );
  }

  if (!genre) {
    throw new Error(
      `지원하지 않는 카드 장르입니다. cardId=${card.id}, genre=${card.genre}`,
    );
  }

  return {
    id: card.id,
    creatorId: card.userId,
    name: card.name,
    grade,
    genre,
    minPrice: card.price,
    description: card.description,
    imageUrl: card.imageUrl,
    totalQuantity: card.totalQuantity,
    remainingQuantity: card.remainingQuantity,
  };
}

export async function seedPhotoCards(tx) {
  const photoCards = cards.map(convertPhotoCard);

  const data = photoCards.map((photoCard) => ({
    id: photoCard.id,
    creatorId: photoCard.creatorId,
    name: photoCard.name,
    grade: photoCard.grade,
    genre: photoCard.genre,
    minPrice: photoCard.minPrice,
    description: photoCard.description,
    imageUrl: photoCard.imageUrl,
    totalQuantity: photoCard.totalQuantity,
  }));

  const result = await tx.photoCard.createMany({
    data,
  });

  return {
    count: result.count,
    items: photoCards,
  };
}
