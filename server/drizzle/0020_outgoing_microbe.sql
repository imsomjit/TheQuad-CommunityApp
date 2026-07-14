CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "tldr" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "embedding" vector(768);