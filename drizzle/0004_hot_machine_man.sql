CREATE TABLE "complaint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"category" varchar(50) NOT NULL,
	"assigned_to" text,
	"submitted_by" text NOT NULL,
	"attachments" jsonb,
	"resolution_notes" text,
	"resolved_at" timestamp,
	"resolved_by" text,
	"closed_at" timestamp,
	"closed_by" text,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(20) DEFAULT 'web_form' NOT NULL,
	"tags" jsonb,
	"escalation_level" varchar(10) DEFAULT 'none' NOT NULL,
	"satisfaction_rating" varchar(10),
	"response_due_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"archived_by" text
);
--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "user_id" SET DEFAULT 'anonymous';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role_better_auth" text;--> statement-breakpoint
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_closed_by_user_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "complaint_status_idx" ON "complaint" USING btree ("status");--> statement-breakpoint
CREATE INDEX "complaint_priority_idx" ON "complaint" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "complaint_assigned_to_idx" ON "complaint" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "complaint_submitted_by_idx" ON "complaint" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "complaint_created_at_idx" ON "complaint" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "complaint_last_activity_idx" ON "complaint" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "complaint_category_idx" ON "complaint" USING btree ("category");