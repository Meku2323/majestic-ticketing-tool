-- CreateTable
CREATE TABLE `systems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `allowed_origin` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `systems_api_key_key`(`api_key`),
    INDEX `systems_api_key_idx`(`api_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_id` INTEGER NOT NULL,
    `type` ENUM('bug', 'feature_request') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('new', 'triaged', 'in_progress', 'blocked', 'done', 'wont_fix', 'duplicate') NOT NULL DEFAULT 'new',
    `priority` ENUM('low', 'medium', 'high', 'critical') NULL,
    `severity` ENUM('minor', 'major', 'critical') NULL,
    `reporter_name` VARCHAR(191) NULL,
    `reporter_email` VARCHAR(191) NULL,
    `reporter_role` VARCHAR(191) NULL,
    `page_url` VARCHAR(2048) NOT NULL,
    `browser_info` VARCHAR(512) NOT NULL,
    `assigned_to` INTEGER NULL,
    `duplicate_of` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tickets_system_id_idx`(`system_id`),
    INDEX `tickets_status_idx`(`status`),
    INDEX `tickets_priority_idx`(`priority`),
    INDEX `tickets_assigned_to_idx`(`assigned_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` INTEGER NOT NULL,
    `file_path` VARCHAR(512) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `source` ENUM('upload', 'captured_screenshot') NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_attachments_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` INTEGER NOT NULL,
    `author_id` INTEGER NULL,
    `body` TEXT NOT NULL,
    `is_internal` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_comments_ticket_id_idx`(`ticket_id`),
    INDEX `ticket_comments_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'triager') NOT NULL DEFAULT 'triager',

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` INTEGER NOT NULL,
    `voter_identifier` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `votes_ticket_id_voter_identifier_key`(`ticket_id`, `voter_identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_system_id_fkey` FOREIGN KEY (`system_id`) REFERENCES `systems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_duplicate_of_fkey` FOREIGN KEY (`duplicate_of`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `ticket_attachments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
