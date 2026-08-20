/*
  Warnings:

  - The values [CLASSICAL] on the enum `GameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "GameTurn" AS ENUM ('b', 'w');

-- AlterEnum
BEGIN;
CREATE TYPE "GameType_new" AS ENUM ('BULLET', 'BLITZ', 'RAPID');
ALTER TABLE "Game" ALTER COLUMN "gameType" TYPE "GameType_new" USING ("gameType"::text::"GameType_new");
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";
DROP TYPE "public"."GameType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "turn" "GameTurn" NOT NULL DEFAULT 'w';
