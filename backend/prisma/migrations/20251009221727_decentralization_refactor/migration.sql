/*
  Warnings:

  - You are about to drop the column `content` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `identityId` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ipnsName]` on the table `Identity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publisherPubKey` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_identityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Identity" DROP CONSTRAINT "Identity_userId_fkey";

-- DropIndex
DROP INDEX "public"."Content_identityId_idx";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "content",
DROP COLUMN "identityId",
ADD COLUMN     "publisherPubKey" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Identity" ADD COLUMN     "ipnsName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio";

-- CreateIndex
CREATE INDEX "Content_publisherPubKey_idx" ON "Content"("publisherPubKey");

-- CreateIndex
CREATE INDEX "Content_tags_idx" ON "Content"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_ipnsName_key" ON "Identity"("ipnsName");

-- CreateIndex
CREATE INDEX "Identity_ipnsName_idx" ON "Identity"("ipnsName");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
