ALTER TABLE "complaint_activity_logs" ALTER COLUMN "actor_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaint_attachments" ALTER COLUMN "uploaded_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaint_comments" ALTER COLUMN "author_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "assigned_to" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "assigned_to" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "submitted_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "resolved_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "closed_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "archived_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "is_urgent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "expected_resolution_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "actual_resolution_time" integer;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "is_reopened" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "reopen_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "reopen_reason" text;