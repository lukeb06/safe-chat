/*
  Warnings:

  - You are about to drop the column `recipientId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `channelName` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "recipientId",
ADD COLUMN     "channelName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelName_fkey" FOREIGN KEY ("channelName") REFERENCES "Channel"("name") ON DELETE CASCADE ON UPDATE CASCADE;
