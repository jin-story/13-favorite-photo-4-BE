-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('ALBUM', 'SPECIAL', 'FAN_SIGN', 'SEASON_GREETING', 'FAN_MEETING', 'CONCERT', 'MD', 'COLLABORATION', 'FAN_CLUB', 'ETC');

-- CreateEnum
CREATE TYPE "ExchangeProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MarketPostingStatus" AS ENUM ('ON_SALE', 'SOLD');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRANSACTION_COMPLETED', 'MARKET_POSTING_SOLD', 'MARKET_POSTING_SOLD_OUT', 'EXCHANGE_PROPOSAL_RECEIVED', 'EXCHANGE_PROPOSAL_APPROVED', 'EXCHANGE_PROPOSAL_REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "encrypted_password" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "provider_id" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_cards" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "genre" "Genre" NOT NULL,
    "min_price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_inventories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "photo_card_id" INTEGER NOT NULL,
    "owned_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_proposals" (
    "id" SERIAL NOT NULL,
    "market_posting_id" INTEGER NOT NULL,
    "proposer_id" INTEGER NOT NULL,
    "offered_inventory_id" INTEGER NOT NULL,
    "message" TEXT,
    "status" "ExchangeProposalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_draws" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "point" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_postings" (
    "id" SERIAL NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "user_inventory_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "exchange_grade" "Grade",
    "exchange_genre" "Genre",
    "exchange_description" TEXT,
    "status" "MarketPostingStatus" NOT NULL DEFAULT 'ON_SALE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "market_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "market_posting_id" INTEGER NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "photo_card_id" INTEGER NOT NULL,
    "transaction_price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "market_posting_id" INTEGER,
    "transaction_id" INTEGER,
    "exchange_proposal_id" INTEGER,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_provider_id_key" ON "users"("provider", "provider_id");

-- CreateIndex
CREATE INDEX "photo_cards_creator_id_created_at_idx" ON "photo_cards"("creator_id", "created_at");

-- CreateIndex
CREATE INDEX "photo_cards_grade_genre_idx" ON "photo_cards"("grade", "genre");

-- CreateIndex
CREATE UNIQUE INDEX "user_inventories_user_id_photo_card_id_key" ON "user_inventories"("user_id", "photo_card_id");

-- CreateIndex
CREATE INDEX "exchange_proposals_market_posting_id_idx" ON "exchange_proposals"("market_posting_id");

-- CreateIndex
CREATE INDEX "exchange_proposals_proposer_id_idx" ON "exchange_proposals"("proposer_id");

-- CreateIndex
CREATE INDEX "point_draws_user_id_created_at_idx" ON "point_draws"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "market_postings_seller_id_idx" ON "market_postings"("seller_id");

-- CreateIndex
CREATE INDEX "market_postings_user_inventory_id_idx" ON "market_postings"("user_inventory_id");

-- CreateIndex
CREATE INDEX "market_postings_status_idx" ON "market_postings"("status");

-- CreateIndex
CREATE INDEX "market_postings_deleted_at_idx" ON "market_postings"("deleted_at");

-- CreateIndex
CREATE INDEX "market_postings_status_deleted_at_idx" ON "market_postings"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "transactions_market_posting_id_idx" ON "transactions"("market_posting_id");

-- CreateIndex
CREATE INDEX "transactions_buyer_id_idx" ON "transactions"("buyer_id");

-- CreateIndex
CREATE INDEX "transactions_seller_id_idx" ON "transactions"("seller_id");

-- CreateIndex
CREATE INDEX "transactions_photo_card_id_idx" ON "transactions"("photo_card_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_market_posting_id_idx" ON "notifications"("market_posting_id");

-- CreateIndex
CREATE INDEX "notifications_transaction_id_idx" ON "notifications"("transaction_id");

-- CreateIndex
CREATE INDEX "notifications_exchange_proposal_id_idx" ON "notifications"("exchange_proposal_id");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- AddForeignKey
ALTER TABLE "photo_cards" ADD CONSTRAINT "photo_cards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_inventories" ADD CONSTRAINT "user_inventories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_inventories" ADD CONSTRAINT "user_inventories_photo_card_id_fkey" FOREIGN KEY ("photo_card_id") REFERENCES "photo_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_proposals" ADD CONSTRAINT "exchange_proposals_market_posting_id_fkey" FOREIGN KEY ("market_posting_id") REFERENCES "market_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_proposals" ADD CONSTRAINT "exchange_proposals_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_proposals" ADD CONSTRAINT "exchange_proposals_offered_inventory_id_fkey" FOREIGN KEY ("offered_inventory_id") REFERENCES "user_inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_draws" ADD CONSTRAINT "point_draws_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_postings" ADD CONSTRAINT "market_postings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_postings" ADD CONSTRAINT "market_postings_user_inventory_id_fkey" FOREIGN KEY ("user_inventory_id") REFERENCES "user_inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_market_posting_id_fkey" FOREIGN KEY ("market_posting_id") REFERENCES "market_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_photo_card_id_fkey" FOREIGN KEY ("photo_card_id") REFERENCES "photo_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_market_posting_id_fkey" FOREIGN KEY ("market_posting_id") REFERENCES "market_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_exchange_proposal_id_fkey" FOREIGN KEY ("exchange_proposal_id") REFERENCES "exchange_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
