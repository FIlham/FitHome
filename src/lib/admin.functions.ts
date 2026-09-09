import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { db } from "../db";
import { exercise, exerciseVariations, news } from "../db/schema";

async function requireAdmin() {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("Unauthorized");
    // isAdmin di-infer dari additionalFields + schema pgTable user.isAdmin
    if (!(session.user as any).isAdmin) throw new Error("Forbidden: Admin only");
    return session;
}

// ---------- Exercise ----------

type CreateExerciseInput = {
    name: string;
    type: "arm" | "leg" | null;
    repetitions: number;
    sets: number;
    rests: number;
    variations?: Array<{
        name: string;
        level?: "easy" | "medium" | "hard" | "custom" | null;
        tools?: string | null;
    }>;
};

export const createExercise = createServerFn({ method: "POST" })
    .validator((data: CreateExerciseInput) => data)
    .handler(async ({ data }) => {
        await requireAdmin();

        const name = data.name?.trim();
        if (!name) throw new Error("Nama program wajib diisi");
        if (name.length > 100) throw new Error("Nama maksimal 100 karakter");

        const reps = Number(data.repetitions);
        const sets = Number(data.sets);
        const rests = Number(data.rests);

        if (!Number.isInteger(reps) || reps < 1 || reps > 100) throw new Error("Repetitions harus 1-100");
        if (!Number.isInteger(sets) || sets < 1 || sets > 20) throw new Error("Sets harus 1-20");
        if (!Number.isInteger(rests) || rests < 0 || rests > 600) throw new Error("Rests harus 0-600 detik");

        const type = data.type ?? null;
        if (type !== null && type !== "arm" && type !== "leg") throw new Error("Tipe harus arm / leg");

        const variations = data.variations ?? [];
        if (variations.length > 10) throw new Error("Maksimal 10 variasi");

        for (const v of variations) {
            if (!v.name?.trim()) throw new Error("Nama variasi wajib diisi");
            if (v.name.trim().length > 80) throw new Error("Nama variasi maksimal 80 karakter");
            if (v.level != null && !["easy", "medium", "hard", "custom"].includes(v.level)) {
                throw new Error("Level variasi tidak valid");
            }
        }

        // insert exercise
        const [created] = await db
            .insert(exercise)
            .values({
                name,
                type: type as any,
                repetitions: reps,
                sets,
                rests,
            })
            .returning();
        if (!created) throw new Error("Gagal membuat exercise");

        // insert variations jika ada
        let insertedVars: typeof exerciseVariations.$inferSelect[] = [];
        if (variations.length > 0) {
            insertedVars = await db
                .insert(exerciseVariations)
                .values(
                    variations.map((v) => ({
                        name: v.name.trim(),
                        level: (v.level ?? null) as any,
                        exerciseId: created.id,
                        tools: v.tools?.trim() ? v.tools.trim() : null,
                    }))
                )
                .returning();
        }

        return { exercise: created, variations: insertedVars };
    });

export const createExerciseVariation = createServerFn({ method: "POST" })
    .validator(
        (data: { exerciseId: string; name: string; level?: "easy" | "medium" | "hard" | "custom" | null; tools?: string | null }) => data
    )
    .handler(async ({ data }) => {
        await requireAdmin();
        if (!data.exerciseId) throw new Error("exerciseId wajib");
        const name = data.name?.trim();
        if (!name) throw new Error("Nama variasi wajib diisi");
        const [created] = await db
            .insert(exerciseVariations)
            .values({
                name,
                level: (data.level ?? null) as any,
                exerciseId: data.exerciseId,
                tools: data.tools?.trim() || null,
            })
            .returning();
        return created;
    });

// list untuk preview admin (reuse guard)
export const listExercisesAdmin = createServerFn({ method: "GET" }).handler(async () => {
    await requireAdmin();
    const rows = await db.query.exercise.findMany({
        with: { exerciseVariations: true },
        orderBy: (e, { desc }) => [desc(e.id)],
    });
    return rows;
});

// ---------- News ----------

type CreateNewsInput = {
    title: string;
    content: string;
};

export const createNews = createServerFn({ method: "POST" })
    .validator((data: CreateNewsInput) => data)
    .handler(async ({ data }) => {
        await requireAdmin();

        const title = data.title?.trim();
        const content = data.content?.trim();

        if (!title) throw new Error("Judul wajib diisi");
        if (title.length < 3) throw new Error("Judul minimal 3 karakter");
        if (title.length > 200) throw new Error("Judul maksimal 200 karakter");
        if (!content) throw new Error("Konten wajib diisi");
        if (content.length < 10) throw new Error("Konten minimal 10 karakter");
        if (content.length > 10000) throw new Error("Konten maksimal 10000 karakter");

        const [created] = await db.insert(news).values({ title, content }).returning();
        return created;
    });

export const listNewsAdmin = createServerFn({ method: "GET" }).handler(async () => {
    await requireAdmin();
    const rows = await db.query.news.findMany({
        orderBy: (n, { desc }) => [desc(n.created_at)],
        limit: 20,
    });
    return rows;
});
