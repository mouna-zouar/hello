-- AlterTable
ALTER TABLE `column` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `limit` INTEGER NULL DEFAULT 5;

-- AlterTable
ALTER TABLE `task` MODIFY `priority` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NULL,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `endDate` DATETIME(3) NULL,
    MODIFY `progress` INTEGER NULL;
