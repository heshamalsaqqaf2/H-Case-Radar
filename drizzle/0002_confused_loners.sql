ALTER TABLE "complaint_tags" DROP CONSTRAINT "complaint_tags_complaint_id_complaints_id_fk";
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "assigned_to" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "complaint_tags" ADD CONSTRAINT "complaint_tags_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;