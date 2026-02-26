/*
  Warnings:

  - A unique constraint covering the columns `[mobileNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- AlterTable
ALTER TABLE `cities` ADD COLUMN `stateId` INTEGER NULL,
    MODIFY `districtId` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `mobileNumber` VARCHAR(20) NULL,
    MODIFY `email` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_mobileNumber_key` ON `users`(`mobileNumber`);

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `states`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
