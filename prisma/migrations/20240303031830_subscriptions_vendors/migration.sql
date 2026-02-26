-- CreateTable
CREATE TABLE `subscriptions_vendors` (
    `vendorId` INTEGER NOT NULL,
    `subscriptionId` INTEGER NOT NULL,

    PRIMARY KEY (`vendorId`, `subscriptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscriptions_vendors` ADD CONSTRAINT `subscriptions_vendors_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions_vendors` ADD CONSTRAINT `subscriptions_vendors_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
