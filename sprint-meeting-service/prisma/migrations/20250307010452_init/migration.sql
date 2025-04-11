-- CreateTable
CREATE TABLE `SprintMeeting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sprintId` INTEGER NOT NULL,
    `taskId` INTEGER NULL,
    `projectId` INTEGER NULL,
    `meetingDate` DATETIME(3) NOT NULL,
    `agenda` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `onlineMeetingLink` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SprintMeetingParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meetingId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SprintMeetingParticipant` ADD CONSTRAINT `SprintMeetingParticipant_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `SprintMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
