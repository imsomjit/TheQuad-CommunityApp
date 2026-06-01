ALTER TABLE "users" ADD COLUMN "gender" "gender" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" date DEFAULT '2000-01-01' NOT NULL;