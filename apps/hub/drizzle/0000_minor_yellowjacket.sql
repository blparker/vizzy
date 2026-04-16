CREATE TABLE "vizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" text DEFAULT 'Untitled' NOT NULL,
	"code_ts" text NOT NULL,
	"code_js" text NOT NULL,
	"forked_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "vizzes_owner_idx" ON "vizzes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "vizzes_created_idx" ON "vizzes" USING btree ("created_at");