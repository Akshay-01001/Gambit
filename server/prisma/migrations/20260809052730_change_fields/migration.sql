/*
  Warnings:

  - You are about to drop the column `sen` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "sen",
ADD COLUMN     "pgn" TEXT NOT NULL DEFAULT '';
