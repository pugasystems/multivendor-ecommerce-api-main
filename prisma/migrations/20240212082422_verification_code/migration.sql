-- AlterTable
ALTER TABLE `users` ADD COLUMN `verifiedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `verfication_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `verificationCode` INTEGER NOT NULL,
    `type` ENUM('registration', 'forgotPassword', 'verifyEmailChange') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `verfication_codes` ADD CONSTRAINT `verfication_codes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
