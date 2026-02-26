-- AlterTable
ALTER TABLE `vendors` ADD COLUMN `registeredAt` INTEGER NULL,
    ADD COLUMN `taxId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_registeredAt_fkey` FOREIGN KEY (`registeredAt`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
