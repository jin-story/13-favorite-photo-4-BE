import { Router } from "express";

import { protect } from "../../middlewares/auth.js";
import { uploadImage } from "../../middlewares/imageUpload.js";
import { validate, validateRequest } from "../../middlewares/validate.js";
import photoCardController from "./photo-card.controller.js";
import {
  createPhotoCardBodySchema,
  listMyPhotoCardsQuerySchema,
} from "./photo-card.schema.js";

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     PhotoCardCreator:
 *       type: object
 *       required: [id, nickname]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nickname:
 *           type: string
 *           example: "card-master"
 *
 *     PhotoCard:
 *       type: object
 *       required: [id, creatorId, creator, name, grade, genre, minPrice, description, imageUrl, totalQuantity, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         creatorId:
 *           type: integer
 *           example: 1
 *         creator:
 *           $ref: "#/components/schemas/PhotoCardCreator"
 *         name:
 *           type: string
 *           example: "Winter Special Card"
 *         grade:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *           example: "RARE"
 *         genre:
 *           type: string
 *           enum:
 *             - ALBUM
 *             - SPECIAL
 *             - FAN_SIGN
 *             - SEASON_GREETING
 *             - FAN_MEETING
 *             - CONCERT
 *             - MD
 *             - COLLABORATION
 *             - FAN_CLUB
 *             - ETC
 *           example: "SPECIAL"
 *         minPrice:
 *           type: integer
 *           example: 1000
 *         description:
 *           type: string
 *           example: "Winter special photocard"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: "http://localhost:3001/images/550e8400-e29b-41d4-a716-446655440000.webp"
 *         totalQuantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /photo-cards:
 *   post:
 *     summary: 포토카드 생성
 *     description: 이미지와 포토카드 정보를 등록하고, 생성한 포토카드의 총 발행량만큼 생성자의 보유 카드 정보를 생성합니다. 포토카드와 보유 카드 생성은 동일한 DB 트랜잭션으로 처리됩니다.
 *     tags:
 *       - PhotoCard
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - image
 *               - name
 *               - grade
 *               - genre
 *               - minPrice
 *               - description
 *               - totalQuantity
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG, PNG, WEBP 형식의 이미지 파일 1개(최대 5MB)
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: '\S'
 *                 example: "Winter Special Card"
 *               grade:
 *                 type: string
 *                 enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                 example: "RARE"
 *               genre:
 *                 type: string
 *                 enum:
 *                   - ALBUM
 *                   - SPECIAL
 *                   - FAN_SIGN
 *                   - SEASON_GREETING
 *                   - FAN_MEETING
 *                   - CONCERT
 *                   - MD
 *                   - COLLABORATION
 *                   - FAN_CLUB
 *                   - ETC
 *                 example: "SPECIAL"
 *               minPrice:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1000
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 pattern: '\S'
 *                 example: "Winter special photocard"
 *               totalQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 10
 *           encoding:
 *             image:
 *               contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       '201':
 *         description: 포토카드 생성 성공. 생성자에게 총 발행량만큼의 보유 카드가 생성되며, 포토카드와 보유 카드 생성은 동일한 DB 트랜잭션으로 처리됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PhotoCard"
 *       '400':
 *         description: 요청값 검증 실패, 이미지 누락 또는 이미지 형식/용량 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidRequest:
 *                 summary: 요청값 검증 실패
 *                 value:
 *                   path: /photo-cards
 *                   method: POST
 *                   status: 400
 *                   code: INVALID_REQUEST
 *                   message: 입력 데이터가 올바르지 않습니다.
 *                   date: "2026-07-23T12:00:00.000Z"
 *               imageRequired:
 *                 summary: 이미지 누락
 *                 value:
 *                   path: /photo-cards
 *                   method: POST
 *                   status: 400
 *                   code: PHOTO_CARD_IMAGE_REQUIRED
 *                   message: 포토카드 이미지를 업로드해 주세요.
 *                   date: "2026-07-23T12:00:00.000Z"
 *               invalidImageType:
 *                 summary: 이미지 형식 오류
 *                 value:
 *                   path: /photo-cards
 *                   method: POST
 *                   status: 400
 *                   code: INVALID_IMAGE_TYPE
 *                   message: JPEG, PNG, WEBP 이미지만 업로드할 수 있습니다.
 *                   date: "2026-07-23T12:00:00.000Z"
 *               imageFileTooLarge:
 *                 summary: 이미지 용량 초과
 *                 value:
 *                   path: /photo-cards
 *                   method: POST
 *                   status: 400
 *                   code: IMAGE_FILE_TOO_LARGE
 *                   message: 이미지 파일은 최대 5MB까지 업로드할 수 있습니다.
 *                   date: "2026-07-23T12:00:00.000Z"
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         description: 이미지 업로드·파일 시스템 오류 또는 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               path: /photo-cards
 *               method: POST
 *               status: 500
 *               code: INTERNAL_SERVER_ERROR
 *               message: 서버 오류가 발생했습니다.
 *               date: "2026-07-23T12:00:00.000Z"
 */

router.post(
  "/",
  protect,
  uploadImage,
  validate(createPhotoCardBodySchema),
  photoCardController.createPhotoCard,
);

/**
 * @swagger
 * /photo-cards/me:
 *   get:
 *     summary: 내 포토카드 목록 조회
 *     description: 로그인 사용자가 보유한 수량 1개 이상의 포토카드를 조회합니다.
 *     tags: [PhotoCard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           minLength: 1
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [ALBUM, SPECIAL, FAN_SIGN, SEASON_GREETING, FAN_MEETING, CONCERT, MD, COLLABORATION, FAN_CLUB, ETC]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, price_asc, price_desc]
 *           default: recent
 *     responses:
 *       '200':
 *         description: 내 포토카드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [list, pagination]
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/PhotoCard'
 *                       - type: object
 *                         required: [ownedQuantity]
 *                         properties:
 *                           ownedQuantity:
 *                             type: integer
 *                 pagination:
 *                   type: object
 *                   required: [page, limit, total, totalPages]
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/me",
  protect,
  validateRequest({ query: listMyPhotoCardsQuerySchema }),
  photoCardController.listMyPhotoCards,
);

export default router;
