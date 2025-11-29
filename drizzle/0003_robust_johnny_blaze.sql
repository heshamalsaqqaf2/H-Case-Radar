CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to" text NOT NULL,
	"from" text NOT NULL,
	"cc" text,
	"bcc" text,
	"subject" text NOT NULL,
	"template" text NOT NULL,
	"template_data" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"error_stack" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"last_attempt_at" timestamp,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"priority" text DEFAULT 'normal' NOT NULL,
	"user_id" text,
	"opened" boolean DEFAULT false,
	"opened_at" timestamp,
	"clicked" boolean DEFAULT false,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"preferences" jsonb DEFAULT '{"complaint_assigned":true,"complaint_status_updated":true,"complaint_commented":true,"complaint_resolved":true,"complaint_escalated":true,"sla_warning":true,"sla_exceeded":true,"account_status_changed":true,"password_reset":true,"weekly_report":false,"monthly_report":false}'::jsonb,
	"report_frequency" text DEFAULT 'never',
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"quiet_hours_timezone" text DEFAULT 'Asia/Riyadh',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;