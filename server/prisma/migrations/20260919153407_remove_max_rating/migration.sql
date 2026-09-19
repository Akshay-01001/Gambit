/*
  Warnings:

  - You are about to drop the column `classicalRating` on the `ChessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `highestRating` on the `ChessProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChessProfile" DROP COLUMN "classicalRating",
DROP COLUMN "highestRating";
