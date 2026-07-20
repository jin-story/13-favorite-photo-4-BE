import { Router } from "express";

import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as photoCardController from "./photo-card.controller.js";
import {
  createPhotoCardBodySchema,
  photoCardIdParamsSchema,
  listPhotoCardsQuerySchema,
} from "./photo-card.schema.js";
import { validateRequest } from "./photo-card.validate.js";

const router = Router();

router.post(
  "/",
  protect,
  validate(createPhotoCardBodySchema),
  photoCardController.createPhotoCard,
);

router.get(
  "/",
  validateRequest({ query: listPhotoCardsQuerySchema }),
  photoCardController.listPhotoCards,
);

router.get(
  "/me",
  protect,
  validateRequest({ query: listPhotoCardsQuerySchema }),
  photoCardController.listMyPhotoCards,
);

router.get(
  "/:photoCardId",
  validateRequest({ params: photoCardIdParamsSchema }),
  photoCardController.getPhotoCard,
);

export default router;
