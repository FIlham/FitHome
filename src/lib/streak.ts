import { eq } from "drizzle-orm";
import { db } from "../db";
import { streakLog, userStreak } from "../db/schema";

// Business rule: day3=1pt, day4=2pt, ... => points = streak - 2 if streak >=3
export function calcDailyPoint(streakCount: number): number {
  if (streakCount < 3) return 0;
  return streakCount - 2;
}

// Normalize date to WIB 00:00:00 for day comparison
export function getWIBDateOnly(date: Date): Date {
  // Create date string in WIB timezone, then parse back to 00:00 WIB
  const wibStr = date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD
  // wibStr is YYYY-MM-DD in WIB, construct as UTC midnight then treat as WIB midnight
  // Simpler: create Date at 00:00 WIB = 17:00 UTC previous day (WIB UTC+7)
  // But for diff we just need consistent day number, so parse wibStr
  return new Date(wibStr + "T00:00:00.000Z"); // use UTC to compare equally; both dates converted same way so diff is correct
}

export function diffDaysWIB(last: Date, today: Date): number {
  const a = getWIBDateOnly(last);
  const b = getWIBDateOnly(today);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000);
}

export function getWIBTodayMidnight(now = new Date()): Date {
  const wibStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  return new Date(wibStr + "T00:00:00.000+07:00");
}

export type ClaimResult =
  | { success: true; currentStreak: number; pointsEarned: number; totalPoints: number; longestStreak: number; isNewRecord: boolean; reset: boolean }
  | { success: false; error: "ALREADY_CLAIMED_TODAY"; currentStreak: number }
  | { success: false; error: string };

export async function claimStreak(userId: string, now = new Date()): Promise<ClaimResult> {
  const todayWIB = getWIBTodayMidnight(now);

  // Transaction to avoid race condition
  return await db.transaction(async (tx) => {
    const existing = await tx.query.userStreak.findFirst({
      where: { userId },
    });

    // First ever workout
    if (!existing) {
      await tx.insert(userStreak).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: 0,
        lastWorkoutDate: todayWIB,
      });
      await tx.insert(streakLog).values({
        userId,
        workoutDate: todayWIB,
        streakCount: 1,
        pointsEarned: 0,
      });
      return {
        success: true,
        currentStreak: 1,
        pointsEarned: 0,
        totalPoints: 0,
        longestStreak: 1,
        isNewRecord: false,
        reset: false,
      } as ClaimResult;
    }

    const lastDate = existing.lastWorkoutDate;
    // Should not happen but handle null
    if (!lastDate) {
      const pointsEarned = calcDailyPoint(1);
      await tx.update(userStreak).set({
        currentStreak: 1,
        lastWorkoutDate: todayWIB,
        updatedAt: new Date(),
      }).where(eq(userStreak.userId, userId));
      await tx.insert(streakLog).values({ userId, workoutDate: todayWIB, streakCount: 1, pointsEarned });
      return { success: true, currentStreak: 1, pointsEarned, totalPoints: existing.totalPoints + pointsEarned, longestStreak: existing.longestStreak, isNewRecord: false, reset: false } as ClaimResult;
    }

    const diff = diffDaysWIB(lastDate, todayWIB);

    if (diff === 0) {
      return { success: false, error: "ALREADY_CLAIMED_TODAY", currentStreak: existing.currentStreak } as ClaimResult;
    }

    if (diff === 1) {
      const newStreak = existing.currentStreak + 1;
      const pointsEarned = calcDailyPoint(newStreak);
      const totalPoints = existing.totalPoints + pointsEarned;
      const longestStreak = Math.max(existing.longestStreak, newStreak);
      const isNewRecord = newStreak > existing.longestStreak;

      await tx.update(userStreak).set({
        currentStreak: newStreak,
        longestStreak,
        totalPoints,
        lastWorkoutDate: todayWIB,
        updatedAt: new Date(),
      }).where(eq(userStreak.userId, userId));

      await tx.insert(streakLog).values({
        userId,
        workoutDate: todayWIB,
        streakCount: newStreak,
        pointsEarned,
      });

      return { success: true, currentStreak: newStreak, pointsEarned, totalPoints, longestStreak, isNewRecord, reset: false } as ClaimResult;
    }

    if (diff > 1) {
      // Streak broken, reset to 1
      const newStreak = 1;
      const pointsEarned = 0;
      // longest stays, totalPoints unchanged
      await tx.update(userStreak).set({
        currentStreak: newStreak,
        lastWorkoutDate: todayWIB,
        updatedAt: new Date(),
      }).where(eq(userStreak.userId, userId));

      await tx.insert(streakLog).values({
        userId,
        workoutDate: todayWIB,
        streakCount: newStreak,
        pointsEarned,
      });

      return { success: true, currentStreak: newStreak, pointsEarned, totalPoints: existing.totalPoints, longestStreak: existing.longestStreak, isNewRecord: false, reset: true } as ClaimResult;
    }

    // diff < 0 means client clock is behind, treat as already claimed or error
    return { success: false, error: "INVALID_DATE" } as ClaimResult;
  });
}

export async function getStreakStatus(userId: string) {
  const streak = await db.query.userStreak.findFirst({ where: { userId } });
  if (!streak) return { currentStreak: 0, longestStreak: 0, totalPoints: 0, lastWorkoutDate: null };
  return streak;
}

export async function getStreakHistory(userId: string, limit = 30) {
  const logs = await db.query.streakLog.findMany({
    where: { userId },
    orderBy: (t, { desc }) => [desc(t.workoutDate)],
    limit,
  });
  return logs;
}
