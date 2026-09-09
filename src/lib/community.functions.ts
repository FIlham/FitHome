import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { db } from "../db";
import { communityMessage } from "../db/schema";
import { lt, gte, eq, asc } from "drizzle-orm";
import { user } from "../db/schema";

// MVP: global room, retensi 7 hari, markdown, no moderasi, polling 3s
async function requireAuth() {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session;
}

function retentionCutoff() {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// GET 50 terbaru dalam 7 hari, lazy purge expired
export const listCommunityMessages = createServerFn({ method: "GET" })
    .validator((data: { limit?: number } = {}) => data)
    .handler(async ({ data }) => {
        await requireAuth();
        const limit = Math.min(Math.max(data.limit ?? 50, 1), 100);
        const cutoff = retentionCutoff();

        // lazy purge: hapus >7 hari (fire-and-forget, jangan block list)
        // pakai try/catch biar list tetap jalan walau delete gagal
        try {
            await db.delete(communityMessage).where(lt(communityMessage.createdAt, cutoff));
        } catch { }

        // pakai select + join agar where gte/asc typed dengan benar (drizzle-orm rc4 query relations where typed beda)
        const rows = await db
            .select({
                id: communityMessage.id,
                content: communityMessage.content,
                createdAt: communityMessage.createdAt,
                userId: communityMessage.userId,
                user: { id: user.id, name: user.name, image: user.image },
            })
            .from(communityMessage)
            .leftJoin(user, eq(communityMessage.userId, user.id))
            .where(gte(communityMessage.createdAt, cutoff))
            .orderBy(asc(communityMessage.createdAt))
            .limit(limit);
        return rows;
    });

// POST markdown 1-2000 char, rate-limit sederhana: min 1s antar kirim per handler? -> cukup validasi, throttle di client + server 2s
const lastSendAt = new Map<string, number>();

export const sendCommunityMessage = createServerFn({ method: "POST" })
    .validator((data: { content: string }) => data)
    .handler(async ({ data }) => {
        const session = await requireAuth();
        const raw = data.content?.trim();
        if (!raw) throw new Error("Pesan kosong");
        if (raw.length > 2000) throw new Error("Maks 2000 karakter");
        if (raw.length < 1) throw new Error("Minimal 1 karakter");

        // simple in-memory throttle 2s per user (per server instance MVP)
        const now = Date.now();
        const last = lastSendAt.get(session.user.id) ?? 0;
        if (now - last < 2000) throw new Error("Terlalu cepat, tunggu 2 detik");
        lastSendAt.set(session.user.id, now);

        const [created] = await db.insert(communityMessage).values({
            userId: session.user.id,
            content: raw,
        }).returning();
        if (!created) throw new Error("Gagal kirim pesan");

        // fetch with user untuk invalidasi cache (pakai join biar typing aman)
        const [withUser] = await db
            .select({
                id: communityMessage.id,
                content: communityMessage.content,
                createdAt: communityMessage.createdAt,
                userId: communityMessage.userId,
                user: { id: user.id, name: user.name, image: user.image },
            })
            .from(communityMessage)
            .leftJoin(user, eq(communityMessage.userId, user.id))
            .where(eq(communityMessage.id, created.id))
            .limit(1);
        return withUser ?? created;
    });
