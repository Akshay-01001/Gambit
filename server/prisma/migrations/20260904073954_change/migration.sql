-- AlterEnum
ALTER TYPE "AuthProvider" ADD VALUE 'BOTH';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;
