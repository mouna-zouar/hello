-- DropForeignKey
ALTER TABLE `invitation` DROP FOREIGN KEY `Invitation_userId_fkey`;

-- DropIndex
DROP INDEX `Invitation_userId_fkey` ON `invitation`;

-- AlterTable
ALTER TABLE `invitation` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
