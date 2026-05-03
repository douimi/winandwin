ALTER TABLE "prizes" ADD COLUMN "redemption_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "redemption_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL;
