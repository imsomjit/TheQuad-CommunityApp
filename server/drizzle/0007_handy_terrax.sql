CREATE TYPE "public"."opportunity_source" AS ENUM('CODEFORCES', 'KAGGLE');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('CODING_CONTEST', 'DATA_SCIENCE_COMPETITION');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('UPCOMING', 'ONGOING', 'ENDED');--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" "opportunity_source" NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"official_url" varchar(500) NOT NULL,
	"type" "opportunity_type" NOT NULL,
	"status" "opportunity_status" NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"deadline" timestamp with time zone,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunities_source_source_id_unique" UNIQUE("source","source_id")
);
--> statement-breakpoint
CREATE TABLE "opportunity_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"opportunity_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_bookmarks_user_id_opportunity_id_unique" UNIQUE("user_id","opportunity_id")
);
--> statement-breakpoint
ALTER TABLE "opportunity_bookmarks" ADD CONSTRAINT "opportunity_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_bookmarks" ADD CONSTRAINT "opportunity_bookmarks_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opportunities_title_idx" ON "opportunities" USING btree ("title");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opportunities_type_idx" ON "opportunities" USING btree ("type");