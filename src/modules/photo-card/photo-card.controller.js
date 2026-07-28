import photoCardService from "./photo-card.service.js";

async function createPhotoCard(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("포토카드 이미지를 업로드해 주세요.");
      error.status = 400;
      error.code = "PHOTO_CARD_IMAGE_REQUIRED";

      throw error;
    }

    const photoCard = await photoCardService.createPhotoCard(req.user.userId, {
      ...req.body,
      imageUrl: req.file.path,
    });

    res.status(201).json(photoCard);
  } catch (error) {
    next(error);
  }
}

export default {
  createPhotoCard,
};
