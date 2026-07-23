import photoCardService from "./photo-card.service.js";

async function createPhotoCard(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("포토카드 이미지를 업로드해 주세요.");
      error.status = 400;
      error.code = "PHOTO_CARD_IMAGE_REQUIRED";

      throw error;
    }

    if (!process.env.SERVER_URL) {
      throw new Error("SERVER_URL 환경변수가 설정되지 않았습니다.");
    }

    const imageUrl = new URL(
      `/images/${req.file.filename}`,
      process.env.SERVER_URL,
    ).toString();

    const photoCard = await photoCardService.createPhotoCard(req.user.userId, {
      ...req.body,
      imageUrl,
    });

    res.status(201).json(photoCard);
  } catch (error) {
    next(error);
  }
}

export default {
  createPhotoCard,
};
