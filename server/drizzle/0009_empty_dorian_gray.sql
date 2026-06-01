CREATE TYPE "public"."opportunity_moderation_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('warn', 'suspend', 'ban');--> statement-breakpoint
ALTER TYPE "public"."report_target_type" ADD VALUE 'opportunity' BEFORE 'user';--> statement-breakpoint
CREATE TABLE "user_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action_type" "action_type" NOT NULL,
	"duration_days" integer,
	"reason" text NOT NULL,
	"issued_by_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reason" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."report_reason";--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'harassment', 'abusive', 'misleading', 'copyright', 'inappropriate', 'duplicate', 'other');--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reason" SET DATA TYPE "public"."report_reason" USING "reason"::"public"."report_reason";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."report_status";--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'under_review', 'resolved', 'dismissed');--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."report_status";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DATA TYPE "public"."report_status" USING "status"::"public"."report_status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspension_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "answer_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "content_snapshot" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "assigned_to_id" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "moderation_status" "opportunity_moderation_status" DEFAULT 'APPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_actions" ADD CONSTRAINT "user_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_actions" ADD CONSTRAINT "user_actions_issued_by_id_users_id_fk" FOREIGN KEY ("issued_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;