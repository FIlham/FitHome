CREATE TABLE "streak_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"workout_date" timestamp NOT NULL,
	"streak_count" integer NOT NULL,
	"points_earned" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streak" (
	"user_id" text PRIMARY KEY,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"last_workout_date" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"exercise_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"config" json,
	"status" text,
	"start_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "streak_log_user_date_uidx" ON "streak_log" ("user_id","workout_date");--> statement-breakpoint
CREATE INDEX "streak_log_userId_idx" ON "streak_log" ("user_id");--> statement-breakpoint
CREATE INDEX "workout_session_userId_idx" ON "workout_session" ("user_id");--> statement-breakpoint
CREATE INDEX "workout_session_exerciseId_idx" ON "workout_session" ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_session_variantId_idx" ON "workout_session" ("variant_id");--> statement-breakpoint
ALTER TABLE "streak_log" ADD CONSTRAINT "streak_log_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_exercise_id_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id");--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_variant_id_exercise_variation_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "exercise_variation"("id");