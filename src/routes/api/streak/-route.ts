import Elysia, { t } from "elysia";
import { auth } from "../../../lib/auth";
import { claimStreak, getStreakHistory, getStreakStatus } from "../../../lib/streak";

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

export const streakRoute = new Elysia({ prefix: "/streak" })
  .get(
    "/status",
    async ({ request, set }) => {
      const userId = await getUserIdFromRequest(request);
      if (!userId) {
        set.status = 401;
        return { success: false as const, message: "Unauthorized" };
      }
      const status = await getStreakStatus(userId);
      return { success: true as const, data: status };
    },
    {
      detail: { summary: "Get streak status", description: "Get current streak, longest, total points" },
    }
  )
  .get(
    "/history",
    async ({ request, set, query }) => {
      const userId = await getUserIdFromRequest(request);
      if (!userId) {
        set.status = 401;
        return { success: false as const, message: "Unauthorized" };
      }
      const limit = query.limit ? Math.min(Number(query.limit), 100) : 30;
      const history = await getStreakHistory(userId, limit);
      return { success: true as const, data: history };
    },
    {
      query: t.Object({ limit: t.Optional(t.String()) }),
      detail: { summary: "Get streak history" },
    }
  )
  .post(
    "/claim",
    async ({ request, set }) => {
      const userId = await getUserIdFromRequest(request);
      if (!userId) {
        set.status = 401;
        return { success: false as const, message: "Unauthorized" };
      }
      const result = await claimStreak(userId);
      if (!result.success) {
        if (result.error === "ALREADY_CLAIMED_TODAY") {
          set.status = 409;
          return { success: false as const, message: "Streak sudah diklaim hari ini", data: result };
        }
        set.status = 400;
        return { success: false as const, message: result.error, data: result };
      }
      return {
        success: true as const,
        data: result,
        message: result.reset ? "Streak patah, reset ke 1" : result.pointsEarned > 0 ? `Dapat ${result.pointsEarned} poin streak!` : "Streak bertambah",
      };
    },
    {
      detail: { summary: "Claim daily streak", description: "Dipanggil saat workout valid selesai. 1x per hari WIB." },
    }
  );
