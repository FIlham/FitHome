import Elysia, { t } from "elysia";
import { db } from "../../../db";
import { auth } from "../../../lib/auth";
import { claimStreak } from "../../../lib/streak";
import { workoutSession } from "../../../db/schema";

export const exerciseRoute = new Elysia({ prefix: "/exercise" })
    .get("/", () => ({ success: true, message: "Exercise route is active", data: null }), {
        detail: {
            description: "Health check for exercise route",
            summary: "test the route"
        }
    })
    .get("/all", async ({ set }) => {
        try {
            const exercises = await db.query.exercise.findMany()
            return {
                success: true as const,
                data: exercises,
            }
        } catch (error) {
            set.status = 500
            return {
                success: false as const,
                message: "Internal server error",
            }
        }
    }, {
        detail: {
            summary: "get all exercises",
        }
    })
    .get("/:exerciseId", async ({ params: { exerciseId }, set }) => {
        try {
            const exercise = await db.query.exercise.findFirst({
                where: {
                    id: exerciseId
                },
                with: {
                    exerciseVariations: true
                }
            })
            if (!exercise) {
                set.status = 404
                return {
                    success: false as const,
                    message: "Exercise not found",
                }
            }
            return {
                success: true as const,
                data: exercise,
            }
        } catch (error) {
            set.status = 500
            return {
                success: false as const,
                message: "Internal server error",
            }
        }
    }, {
        params: t.Object({
            exerciseId: t.String()
        }),
        detail: {
            summary: "get one exercise with id",
            description: "get the exercise id. if don't know which one, get it from `/all` endpoint"
        }
    })
    .get("/:exerciseId/variants", async ({ params: { exerciseId }, set }) => {
        try {
            const exercise = await db.query.exercise.findFirst({
                where: {
                    id: exerciseId
                },
                with: {
                    exerciseVariations: true
                }
            })
            if (!exercise) {
                set.status = 404
                return {
                    success: false as const,
                    message: "Exercise not found",
                }
            }
            return {
                success: true as const,
                data: exercise.exerciseVariations,
            }
        } catch (error) {
            set.status = 500
            return {
                success: false as const,
                message: "Internal server error",
            }
        }
    }, {
        params: t.Object({
            exerciseId: t.String()
        }),
        detail: {
            summary: "get exercise's variants",
            description: "get the exercise's id first"
        }
    })
    .post("/session", async ({ body, request, set }) => {
        try {
            const session = await auth.api.getSession({ headers: request.headers });
            if (!session?.user?.id) {
                set.status = 401;
                return { success: false as const, message: "Unauthorized" };
            }
            const [created] = await db.insert(workoutSession).values({
                userId: session.user.id,
                exerciseId: body.exerciseId,
                variantId: body.variantId,
                config: body.config,
                status: "completed",
            }).returning();

            // Claim streak (1x per day WIB, idempotent)
            const streakResult = await claimStreak(session.user.id);

            set.status = 201;
            return {
                success: true as const,
                data: { session: created, streak: streakResult },
                message: "Workout session recorded",
            };
        } catch (error: any) {
            if (error?.code === "23505") {
                set.status = 409;
                return { success: false as const, message: "Workout already recorded today" };
            }
            set.status = 500;
            return { success: false as const, message: "Internal server error" };
        }
    }, {
        body: t.Object({
            exerciseId: t.String({ format: "uuid" }),
            variantId: t.String({ format: "uuid" }),
            config: t.Optional(t.Object({ sets: t.Number(), reps: t.Number(), rests: t.Number() })),
        }),
        detail: { summary: "Complete workout session + claim streak" }
    })
