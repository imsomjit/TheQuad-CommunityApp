CREATE TABLE "content_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"user_id" integer,
	"visitor_id" varchar(255),
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "otp" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_view_idx" ON "content_views" USING btree ("user_id","content_type","content_id");--> statement-breakpoint
CREATE INDEX "visitor_view_idx" ON "content_views" USING btree ("visitor_id","content_type","content_id");--> statement-breakpoint
CREATE INDEX "time_view_idx" ON "content_views" USING btree ("viewed_at");