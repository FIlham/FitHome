// import { relations } from "drizzle-orm";
import { defineRelations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    index,
    uniqueIndex,
    uuid,
    pgEnum,
    integer,
    json,
    varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        issuer: text("issuer").notNull(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("account_issuer_accountId_uidx").on(
            table.issuer,
            table.accountId,
        ),
        index("account_userId_idx").on(table.userId),
    ],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const exerciseTypes = pgEnum("exercise_type", ["arm", "leg"])
export const exerciseLevels = pgEnum("exercise_level", ["easy", "medium", "hard", "custom"])

export const exercise = pgTable("exercise", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    type: exerciseTypes(),
    repetitions: integer("repetitions").notNull(),
    sets: integer("sets").notNull(),
    rests: integer("rests").notNull()
})

export const exerciseVariations = pgTable("exercise_variation", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    level: exerciseLevels(),
    exerciseId: uuid("exercise_id").notNull().references(() => exercise.id),
    tools: text("tools")
}, (table) => [index("exercise_variations_exerciseId_idx").on(table.exerciseId)])

export const workoutSession = pgTable("workout_session", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id),
    exerciseId: uuid("exercise_id").notNull().references(() => exercise.id),
    variantId: uuid("variant_id").notNull().references(() => exerciseVariations.id),
    config: json("config").$type<{ sets: number, reps: number, rests: number }>(),
    status: text("status"),
    startTime: timestamp("start_time").defaultNow()
}, (table) => [index("workout_session_userId_idx").on(table.userId), index("workout_session_exerciseId_idx").on(table.exerciseId), index("workout_session_variantId_idx").on(table.variantId)])

export const userStreak = pgTable("user_streak", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
    lastWorkoutDate: timestamp("last_workout_date"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull().defaultNow(),
})

export const streakLog = pgTable("streak_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    workoutDate: timestamp("workout_date").notNull(),
    streakCount: integer("streak_count").notNull(),
    pointsEarned: integer("points_earned").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    uniqueIndex("streak_log_user_date_uidx").on(table.userId, table.workoutDate),
    index("streak_log_userId_idx").on(table.userId),
])

export const news = pgTable("news", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull()
})

export const relations = defineRelations({ user, session, account, verification, exercise, exerciseVariations, workoutSession, userStreak, streakLog, news }, (r) => ({
    user: {
        session: r.many.session(),
        streak: r.one.userStreak({ from: r.user.id, to: r.userStreak.userId }),
        streakLogs: r.many.streakLog(),
    },
    session: {
        user: r.one.user({
            from: r.session.userId,
            to: r.user.id
        })
    },
    account: {
        user: r.one.user({
            from: r.account.userId,
            to: r.user.id
        })
    },
    exercise: {
        exerciseVariations: r.many.exerciseVariations(),
        workoutSession: r.one.workoutSession({
            from: r.exercise.id,
            to: r.workoutSession.exerciseId
        })
    },
    exerciseVariations: {
        exercise: r.one.exercise({
            from: r.exerciseVariations.exerciseId,
            to: r.exercise.id
        }),
        workoutSession: r.one.workoutSession({
            from: r.exerciseVariations.id,
            to: r.workoutSession.variantId
        })
    },
    userStreak: {
        user: r.one.user({ from: r.userStreak.userId, to: r.user.id }),
    },
    streakLog: {
        user: r.one.user({ from: r.streakLog.userId, to: r.user.id }),
    },
}))