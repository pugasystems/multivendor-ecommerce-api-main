-- AlterTable
ALTER TABLE `subscriptions` ADD COLUMN `leadsCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `vendors` ADD COLUMN `leadsCount` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `subscription_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `subscriptionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `tag` VARCHAR(191) NULL,
    `subscriptionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscription_attributes` ADD CONSTRAINT `subscription_attributes_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_items` ADD CONSTRAINT `subscription_items_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
