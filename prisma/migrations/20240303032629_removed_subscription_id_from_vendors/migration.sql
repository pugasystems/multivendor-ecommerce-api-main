/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `vendors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `vendors_subscriptionId_fkey` ON `vendors`;

-- AlterTable
ALTER TABLE `vendors` DROP COLUMN `subscriptionId`;
