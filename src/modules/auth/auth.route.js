import { Router } from "express";
import authController from "./auth.controller.js";
import passport, { protect } from "../../common/middlewares/auth.js";
import { validate } from "../../common/middlewares/validate.js";
import { userCreateSchema, loginSchema } from "./auth.schema.js";

const authRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - nickname
 *         - provider
 *         - providerId
 *         - points
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *           format: email
 *         nickname:
 *           type: string
 *         provider:
 *           type: string
 *           enum: [LOCAL, GOOGLE]
 *         providerId:
 *           type: [string, "null"]
 *         points:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       required:
 *         - user
 *         - accessToken
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - path
 *         - method
 *         - status
 *         - code
 *         - message
 *         - date
 *       properties:
 *         path:
 *           type: string
 *         method:
 *           type: string
 *         status:
 *           type: integer
 *         code:
 *           type: string
 *         message:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *   responses:
 *     Unauthorized:
 *       description: 유효한 액세스 토큰이 필요합니다.
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *             example: Unauthorized
 *     BadRequest:
 *       description: 요청 데이터가 올바르지 않습니다.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Conflict:
 *       description: 이미 존재하는 사용자 또는 닉네임입니다.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

function verifyOrigin(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
  if (!origin || origin !== allowedOrigin) {
    const error = new Error("허용되지 않은 요청 출처입니다.");
    error.status = 403;
    return next(error);
  }
  next();
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 내 정보 조회
 *     description: Bearer 액세스 토큰으로 인증된 현재 사용자 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 현재 로그인한 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         description: 인증된 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.get("/me", protect, authController.getMe);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     description: 이메일, 닉네임, 비밀번호로 로컬 사용자를 생성하고 액세스 토큰과 HttpOnly 리프레시 토큰 쿠키를 발급합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nickname, encryptedPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nickname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 12
 *               encryptedPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly refreshToken 쿠키
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 */
authRouter.post("/signup", validate(userCreateSchema), authController.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 *     description: 이메일과 비밀번호를 검증하고 액세스 토큰과 HttpOnly 리프레시 토큰 쿠키를 발급합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, encryptedPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               encryptedPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly refreshToken 쿠키
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         description: 이메일이 존재하지 않거나 비밀번호가 일치하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: 액세스 토큰 재발급
 *     description: 허용된 Origin과 HttpOnly refreshToken 쿠키를 검증하고 새 액세스 토큰과 리프레시 토큰 쿠키를 발급합니다.
 *     security:
 *       - refreshTokenCookie: []
 *     parameters:
 *       - in: header
 *         name: Origin
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 토큰 재발급 성공
 *         headers:
 *           Set-Cookie:
 *             description: 새 HttpOnly refreshToken 쿠키
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [accessToken]
 *               properties:
 *                 accessToken:
 *                   type: string
 *       '401':
 *         description: refreshToken이 유효하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 요청 출처가 허용되지 않았거나 저장된 refreshToken과 일치하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/refresh-token", verifyOrigin, authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 로그아웃
 *     description: 인증된 사용자의 저장된 리프레시 토큰을 제거하고 refreshToken 쿠키를 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: 로그아웃 성공
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
authRouter.post("/logout", protect, authController.logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: 구글 로그인 시작
 *     description: 구글 로그인 동의 화면으로 리다이렉트합니다.
 *     responses:
 *       '302':
 *         description: 구글 로그인 페이지로 리다이렉트
 */
authRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: 구글 로그인 콜백
 *     description: 구글이 로그인 처리 후 호출하는 콜백 URL입니다. 클라이언트가 직접 호출하지 않습니다.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         description: 구글 인증 성공 시 전달되는 인증 코드
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: 인증 성공 시 액세스 토큰을 쿼리 매개변수로 포함한 클라이언트 콜백 URL로 리다이렉트하고, 인증 실패 시 루트 경로로 리다이렉트
 *         headers:
 *           Set-Cookie:
 *             description: 인증 성공 시 발급되는 HttpOnly refreshToken 쿠키
 *             schema:
 *               type: string
 *           Location:
 *             description: 성공 시 `${CLIENT_URL}/api/auth/callback?token={accessToken}`, 실패 시 `/`
 *             schema:
 *               type: string
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '500':
 *         description: 구글 인증 또는 토큰 발급 처리 중 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  authController.googleCallback,
);

export default authRouter;
