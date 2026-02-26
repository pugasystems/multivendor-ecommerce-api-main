/*
  Warnings:

  - You are about to drop the column `parentCategotyId` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `categories_parentCategotyId_fkey`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `parentCategotyId`,
    ADD COLUMN `parentCategoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentCategoryId_fkey` FOREIGN KEY (`parentCategoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
