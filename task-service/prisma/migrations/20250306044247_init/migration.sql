/*
  Warnings:

  - You are about to drop the column `createdAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `task` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `assignedTo` INTEGER NULL,
    ALTER COLUMN `status` DROP DEFAULT,
    ALTER COLUMN `priority` DROP DEFAULT,
    ALTER COLUMN `type` DROP DEFAULT;
