ALTER TABLE "chat_rooms" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD COLUMN "join_code" varchar(10);--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_join_code_unique" UNIQUE("join_code");