/*
  Warnings:

  - You are about to alter the column `linkPrecedence` on the `contact` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `contact` MODIFY `linkPrecedence` ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary';

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_linkedId_fkey` FOREIGN KEY (`linkedId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
