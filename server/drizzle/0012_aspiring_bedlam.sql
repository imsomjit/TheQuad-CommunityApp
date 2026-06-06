CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('local', 'google', 'both');--> statement-breakpoint
CREATE TYPE "public"."broadcast_type" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'SYSTEM');--> statement-breakpoint
ALTER TYPE "public"."comment_target_type" ADD VALUE 'book';--> statement-breakpoint
ALTER TYPE "public"."vote_target_type" ADD VALUE 'book';--> statement-breakpoint
ALTER TYPE "public"."bookmark_target_type" ADD VALUE 'book';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'upvote_book' BEFORE 'system_welcome';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'comment_on_book' BEFORE 'system_welcome';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'system_broadcast';--> statement-breakpoint
ALTER TYPE "public"."report_target_type" ADD VALUE 'book';--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_enabled" boolean DEFAULT true NOT NULL,
	"announcement_text" text,
	"announcement_type" text DEFAULT 'INFO' NOT NULL,
	"announcement_active" boolean DEFAULT false NOT NULL,
	"social_links" jsonb DEFAULT '{"linkedin":"","instagram":"","twitter":"","discord":"","email":""}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "broadcast_type" DEFAULT 'INFO' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(12),
	"title" varchar(300) NOT NULL,
	"description" text,
	"author" varchar(200) NOT NULL,
	"isbn" varchar(50),
	"subject" varchar(200),
	"file_url" text NOT NULL,
	"file_public_id" text NOT NULL,
	"file_name" varchar(255),
	"file_size" integer,
	"pages" integer,
	"cover_url" text,
	"cover_public_id" text,
	"uploader_id" integer NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"bookmarks_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by_id" integer,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" SET DATA TYPE varchar(12);--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "public_id" varchar(12);--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_public_id_unique" UNIQUE("public_id");