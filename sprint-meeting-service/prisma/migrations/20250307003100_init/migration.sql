/*
  Warnings:

  - You are about to drop the column `participants` on the `sprintmeeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sprintmeeting` DROP COLUMN `participants`,
    MODIFY `taskId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SprintMeetingParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meetingId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SprintMeetingParticipant` ADD CONSTRAINT `SprintMeetingParticipant_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `SprintMeeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
