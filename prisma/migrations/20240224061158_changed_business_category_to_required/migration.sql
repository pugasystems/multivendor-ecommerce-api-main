/*
  Warnings:

  - Made the column `businessCategoryId` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `categories_businessCategoryId_fkey`;

-- AlterTable
ALTER TABLE `categories` MODIFY `businessCategoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_businessCategoryId_fkey` FOREIGN KEY (`businessCategoryId`) REFERENCES `business_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
