import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { getSession } from '../lib/auth.functions'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExercise, createNews, listExercisesAdmin, listNewsAdmin } from '../lib/admin.functions'

export const Route = createFileRoute('/admin')({
    component: RouteComponent,
    beforeLoad: async () => {
        const session = await getSession()
        if (!session) {
            throw redirect({ to: "/login" })
        }
        if (!session.user.isAdmin) {
            throw redirect({ to: "/" })
        }
        return { user: session.user }
    }
})

type VariationDraft = { name: string; level: "easy" | "medium" | "hard" | "custom" | ""; tools: string }

function RouteComponent() {
    const { user } = Route.useRouteContext() as any
    const [tab, setTab] = useState<"program" | "news">("program")

    return (
        <div className="min-h-screen bg-[#0f1115] text-zinc-100">
            {/* header */}
            <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0f1115]/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc107] font-black text-black">F</Link>
                        <div>
                            <p className="text-sm font-bold leading-none">FitHome Admin</p>
                            <p className="text-[11px] text-zinc-400">Halo, {user?.name ?? user?.email} • Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800">← Dashboard</Link>
                        <Link to="/latihan" className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black sm:block">Lihat Latihan</Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                {/* tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab("program")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "program" ? "bg-[#ffc107] text-black" : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                    >
                        <i className="fa-solid fa-dumbbell mr-2" /> Program Latihan
                    </button>
                    <button
                        onClick={() => setTab("news")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "news" ? "bg-[#ffc107] text-black" : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                    >
                        <i className="fa-regular fa-newspaper mr-2" /> News
                    </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500">Semua aksi via <code className="rounded bg-zinc-800 px-1 py-0.5">createServerFn</code> — tanpa endpoint <code className="rounded bg-zinc-800 px-1 py-0.5">/api/*</code> tambahan. Guard <code className="rounded bg-zinc-800 px-1 py-0.5">requireAdmin()</code> di server.</p>

                <div className="mt-6 grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        {tab === "program" ? <ProgramForm /> : <NewsForm />}
                    </div>
                    <div className="lg:col-span-2">
                        {tab === "program" ? <ProgramPreview /> : <NewsPreview />}
                    </div>
                </div>
            </main>
        </div>
    )
}

// ---------------- Program Form ----------------
function ProgramForm() {
    const qc = useQueryClient()
    const [name, setName] = useState("")
    const [type, setType] = useState<"arm" | "leg" | "">("")
    const [reps, setReps] = useState(12)
    const [sets, setSets] = useState(3)
    const [rests, setRests] = useState(60)
    const [variations, setVariations] = useState<VariationDraft[]>([
        { name: "", level: "easy", tools: "" },
    ])
    const [msg, setMsg] = useState<{ kind: "ok" | "err", text: string } | null>(null)

    const mut = useMutation({
        mutationFn: async () => {
            const payload = {
                name,
                type: (type || null) as "arm" | "leg" | null,
                repetitions: Number(reps),
                sets: Number(sets),
                rests: Number(rests),
                variations: variations
                    .filter(v => v.name.trim())
                    .map(v => ({
                        name: v.name.trim(),
                        level: (v.level || null) as any,
                        tools: v.tools.trim() || null,
                    })),
            }
            const res = await createExercise({ data: payload })
            return res
        },
        onSuccess: (res: any) => {
            setMsg({ kind: "ok", text: `Berhasil: "${res.exercise.name}" + ${res.variations.length} variasi` })
            qc.invalidateQueries({ queryKey: ["admin", "exercises"] })
            // reset ringan
            setName("")
            setVariations([{ name: "", level: "easy", tools: "" }])
        },
        onError: (e: any) => setMsg({ kind: "err", text: e?.message ?? String(e) }),
    })

    const addVar = () => {
        if (variations.length >= 10) return
        setVariations(v => [...v, { name: "", level: "easy", tools: "" }])
    }
    const updateVar = (i: number, patch: Partial<VariationDraft>) =>
        setVariations(v => v.map((x, idx) => idx === i ? { ...x, ...patch } : x))
    const removeVar = (i: number) => setVariations(v => v.filter((_, idx) => idx !== i))

    return (
        <form
            onSubmit={e => { e.preventDefault(); setMsg(null); mut.mutate() }}
            className="rounded-2xl border border-zinc-800 bg-[#181b20] p-4 sm:p-5"
        >
            <h2 className="text-sm font-bold">Add Program Latihan</h2>
            <p className="mt-1 text-xs text-zinc-400">Server function <code className="rounded bg-zinc-800 px-1">createExercise</code> — validasi di server, guard admin.</p>

            <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-xs font-semibold text-zinc-300">Nama program *</span>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="mis. Push-up Pemula, Squat Kaki" required maxLength={100}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107] focus:ring-1 focus:ring-[#ffc107]" />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="grid gap-1">
                        <span className="text-xs font-semibold text-zinc-300">Tipe</span>
                        <select value={type} onChange={e => setType(e.target.value as any)}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107]">
                            <option value="">— tanpa tipe —</option>
                            <option value="arm">arm</option>
                            <option value="leg">leg</option>
                        </select>
                    </label>
                    <label className="grid gap-1">
                        <span className="text-xs font-semibold text-zinc-300">Repetitions *</span>
                        <input type="number" min={1} max={100} value={reps} onChange={e => setReps(Number(e.target.value))}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107]" />
                    </label>
                    <label className="grid gap-1">
                        <span className="text-xs font-semibold text-zinc-300">Sets *</span>
                        <input type="number" min={1} max={20} value={sets} onChange={e => setSets(Number(e.target.value))}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107]" />
                    </label>
                </div>

                <label className="grid gap-1">
                    <span className="text-xs font-semibold text-zinc-300">Rest antar set (detik) *</span>
                    <input type="number" min={0} max={600} value={rests} onChange={e => setRests(Number(e.target.value))}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107]" />
                    <span className="text-[11px] text-zinc-500">Dipakai timer di <code className="rounded bg-zinc-800 px-1">start-exercise</code>. 60 = 1 menit.</span>
                </label>

                {/* variations */}
                <div className="rounded-xl border border-dashed border-zinc-700 p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-200">Variasi (opsional)</p>
                        <button type="button" onClick={addVar} disabled={variations.length >= 10}
                            className="rounded-full border border-zinc-600 px-3 py-1 text-xs hover:bg-zinc-800 disabled:opacity-40">+ Tambah</button>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">Kosongkan nama = diabaikan. Maks 10. Level & alat opsional.</p>

                    <div className="mt-3 grid gap-3">
                        {variations.map((v, i) => (
                            <div key={i} className="grid gap-2 rounded-xl bg-zinc-900 p-3 sm:grid-cols-[1.4fr_0.9fr_1fr_auto]">
                                <input value={v.name} onChange={e => updateVar(i, { name: e.target.value })} placeholder={`Variasi #${i + 1} — nama`}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-[#ffc107]" />
                                <select value={v.level} onChange={e => updateVar(i, { level: e.target.value as any })}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-[#ffc107]">
                                    <option value="">level —</option>
                                    <option value="easy">easy</option>
                                    <option value="medium">medium</option>
                                    <option value="hard">hard</option>
                                    <option value="custom">custom</option>
                                </select>
                                <input value={v.tools} onChange={e => updateVar(i, { tools: e.target.value })} placeholder="alat — mis. dumbbell"
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-[#ffc107]" />
                                <button type="button" onClick={() => removeVar(i)} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs hover:bg-zinc-800">hapus</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`mt-4 rounded-xl px-3 py-2 text-xs ${msg.kind === "ok" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-red-500/15 text-red-300 border border-red-500/30"}`}>
                    {msg.text}
                </div>
            )}

            <button type="submit" disabled={mut.isPending || !name.trim()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc107] px-4 py-3 text-sm font-bold text-black hover:bg-[#e0a800] disabled:opacity-40">
                {mut.isPending ? <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" /> Simpan Program</>}
            </button>
            <p className="mt-2 text-center text-[11px] text-zinc-500">Validasi reps 1–100, sets 1–20, rests 0–600 di server.</p>
        </form>
    )
}

function ProgramPreview() {
    const q = useQuery({
        queryKey: ["admin", "exercises"],
        queryFn: () => listExercisesAdmin(),
    })

    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#181b20] p-4 sm:p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Preview Program</h3>
                <button onClick={() => q.refetch()} className="rounded-full border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800">refresh</button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Via <code className="rounded bg-zinc-800 px-1">listExercisesAdmin</code> (server fn GET, guard admin).</p>

            <div className="mt-3 grid gap-2">
                {q.isPending && <p className="text-xs text-zinc-400">Loading...</p>}
                {q.isError && <p className="text-xs text-red-400">{(q.error as Error).message}</p>}
                {q.data?.length === 0 && <p className="text-xs text-zinc-500">Belum ada program — seed atau tambah di kiri.</p>}
                {q.data?.slice(0, 8).map((ex: any) => (
                    <div key={ex.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{ex.name}</p>
                            <span className="shrink-0 rounded-full border border-zinc-600 px-2 py-0.5 text-[10px]">{ex.type ?? "—"}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">{ex.sets} sets × {ex.repetitions} reps • rest {ex.rests}s • {ex.exerciseVariations?.length ?? 0} variasi</p>
                        {ex.exerciseVariations?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {ex.exerciseVariations.slice(0, 4).map((v: any) => (
                                    <span key={v.id} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">{v.name} <span className="opacity-60">• {v.level ?? "-"}</span></span>
                                ))}
                            </div>
                        )}
                        <p className="mt-2 truncate text-[10px] text-zinc-500">{ex.id}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ---------------- News Form ----------------
function NewsForm() {
    const qc = useQueryClient()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [msg, setMsg] = useState<{ kind: "ok" | "err", text: string } | null>(null)

    const mut = useMutation({
        mutationFn: async () => {
            const res = await createNews({ data: { title, content } })
            return res
        },
        onSuccess: (res: any) => {
            setMsg({ kind: "ok", text: `News "${res.title}" berhasil dibuat` })
            qc.invalidateQueries({ queryKey: ["admin", "news"] })
            setTitle("")
            setContent("")
        },
        onError: (e: any) => setMsg({ kind: "err", text: e?.message ?? String(e) }),
    })

    return (
        <form
            onSubmit={e => { e.preventDefault(); setMsg(null); mut.mutate() }}
            className="rounded-2xl border border-zinc-800 bg-[#181b20] p-4 sm:p-5"
        >
            <h2 className="text-sm font-bold">Add News</h2>
            <p className="mt-1 text-xs text-zinc-400">Server function <code className="rounded bg-zinc-800 px-1">createNews</code> — insert langsung ke <code className="rounded bg-zinc-800 px-1">news</code>.</p>

            <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-xs font-semibold text-zinc-300">Judul *</span>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="mis. 5 Tips Recovery Setelah Leg Day" required maxLength={200}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107] focus:ring-1 focus:ring-[#ffc107]" />
                    <span className="text-[11px] text-zinc-500">{title.length}/200</span>
                </label>

                <label className="grid gap-1">
                    <span className="text-xs font-semibold text-zinc-300">Konten *</span>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis konten news... markdown didukung di halaman detail (via Markdown.tsx)" required rows={10} maxLength={10000}
                        className="min-h-[180px] rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107] focus:ring-1 focus:ring-[#ffc107]" />
                    <span className="text-[11px] text-zinc-500">{content.length}/10000 • {content.length < 10 ? "minimal 10 karakter" : "ok"}</span>
                </label>

                <details className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                    <summary className="cursor-pointer text-xs font-semibold">Preview markdown (kasar)</summary>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-zinc-300">{content || "— belum ada konten —"}</pre>
                </details>
            </div>

            {msg && (
                <div className={`mt-4 rounded-xl px-3 py-2 text-xs ${msg.kind === "ok" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-red-500/15 text-red-300 border border-red-500/30"}`}>
                    {msg.text}
                </div>
            )}

            <button type="submit" disabled={mut.isPending || !title.trim() || content.trim().length < 10}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc107] px-4 py-3 text-sm font-bold text-black hover:bg-[#e0a800] disabled:opacity-40">
                {mut.isPending ? <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" /> Publish News</>}
            </button>
        </form>
    )
}

function NewsPreview() {
    const q = useQuery({
        queryKey: ["admin", "news"],
        queryFn: () => listNewsAdmin(),
    })

    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#181b20] p-4 sm:p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Preview News</h3>
                <button onClick={() => q.refetch()} className="rounded-full border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800">refresh</button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Via <code className="rounded bg-zinc-800 px-1">listNewsAdmin</code> (20 terbaru).</p>

            <div className="mt-3 grid gap-2">
                {q.isPending && <p className="text-xs text-zinc-400">Loading...</p>}
                {q.isError && <p className="text-xs text-red-400">{(q.error as Error).message}</p>}
                {q.data?.length === 0 && <p className="text-xs text-zinc-500">Belum ada news.</p>}
                {q.data?.map((n: any) => (
                    <div key={n.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                        <p className="line-clamp-1 text-sm font-semibold">{n.title}</p>
                        <p className="mt-1 line-clamp-3 text-xs text-zinc-400">{n.content?.slice(0, 160)}...</p>
                        <p className="mt-2 text-[10px] text-zinc-500">{new Date(n.created_at).toLocaleString("id-ID")}</p>
                        <Link to="/news/$newsId" params={{ newsId: n.id }} className="mt-1 inline-block text-xs text-[#ffc107] hover:underline">lihat detail →</Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
