DELETE FROM "opportunities" WHERE source = 'CODEFORCES';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'HACKATHON' BEFORE 'DATA_SCIENCE_COMPETITION';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'AI_COMPETITION' BEFORE 'DATA_SCIENCE_COMPETITION';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'HIRING_CHALLENGE';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'OPEN_SOURCE';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'WORKSHOP';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'WEBINAR';--> statement-breakpoint
ALTER TYPE "public"."opportunity_type" ADD VALUE 'OTHER';--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."opportunity_source";--> statement-breakpoint
CREATE TYPE "public"."opportunity_source" AS ENUM('CLIST', 'KAGGLE');--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "source" SET DATA TYPE "public"."opportunity_source" USING "source"::"public"."opportunity_source";--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "organizer" varchar(255);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "raw_data" text;