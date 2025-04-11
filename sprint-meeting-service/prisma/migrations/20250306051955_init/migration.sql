-- CreateTable
CREATE TABLE `SprintMeeting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sprintId` INTEGER NOT NULL,
    `taskId` INTEGER NOT NULL,
    `meetingDate` DATETIME(3) NOT NULL,
    `agenda` VARCHAR(191) NOT NULL,
    `participants` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
