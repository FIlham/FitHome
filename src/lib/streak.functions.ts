import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { getStreakHistory, getStreakStatus } from "./streak";

export const getStreakStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return await getStreakStatus(session.user.id);
});

export const getStreakHistoryFn = createServerFn({ method: "GET" })
  .validator((data: { limit?: number } = {}) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("Unauthorized");
    return await getStreakHistory(session.user.id, data.limit ?? 30);
  });
