import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { exerciseKeys } from '../../lib/query'
import { api } from '../../lib/treaty'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/latihan')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: exerciseKeys.all,
        queryFn: async () => {
            const res = await api.exercise.all.get()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message ?? "Gagal fetch latihan")
            return res.data.data as any[]
        },
    })
    const [openId, setOpenId] = useState<string | null>(null)

    if (isPending) return <div style={{ padding: 16 }}>Loading latihan...</div>
    if (isError) return <div style={{ padding: 16, color: 'red' }}>Error: {(error as Error).message} <button onClick={() => refetch()} style={{ marginLeft: 8 }}>Retry</button></div>

    return (
        <div style={{ padding: 16, maxWidth: 640 }}>
            <Link to="/dashboard">← Dashboard</Link>
            <h1>Program Latihan (kasar)</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>GET /api/exercise/all + GET /:id/variants (kasar, styling terakhir). Total {data.length} program.</p>

            {data.length === 0 ? <p>Tidak ada latihan — seed dulu</p> : data.map((x: any) => (
                <div key={x.id} style={{ border: "1px solid #111", padding: 12, marginTop: 12, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>{x.name}</strong>
                        <span style={{ fontSize: 11, border: "1px solid #999", padding: "2px 6px", borderRadius: 4 }}>{x.type ?? "-"}</span>
                    </div>
                    <p style={{ fontSize: 13, margin: "8px 0 0" }}>{x.sets} sets × {x.repetitions} reps • rest {x.rests}m</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Link to="/start-exercise/$exerciseId" params={{ exerciseId: x.id }} style={btn}>Mulai Latihan →</Link>
                        <button onClick={() => setOpenId(openId === x.id ? null : x.id)} style={btnGhost}>{openId === x.id ? "Tutup" : "Detail variasi"}</button>
                    </div>
                    {openId === x.id && <VariantBox exerciseId={x.id} />}
                    <details style={{ marginTop: 8 }}><summary style={{ fontSize: 11 }}>raw exercise</summary><pre style={pre}>{JSON.stringify(x, null, 2)}</pre></details>
                </div>
            ))}
        </div>
    )
}

function VariantBox({ exerciseId }: { exerciseId: string }) {
    const q = useQuery({
        queryKey: ["exercise", exerciseId, "variants"],
        queryFn: async () => {
            const res = await api.exercise({ exerciseId }).variants.get()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message)
            return res.data.data as any[]
        }
    })
    if (q.isPending) return <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Loading variasi...</p>
    if (q.isError) return <p style={{ fontSize: 12, color: "crimson" }}>{(q.error as Error).message}</p>
    if (!q.data || q.data.length === 0) return <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Tidak ada variasi</p>
    return (
        <div style={{ marginTop: 8, borderTop: "1px dashed #ccc", paddingTop: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600 }}>{q.data.length} variasi:</p>
            {q.data.map((v: any) => (
                <div key={v.id} style={{ fontSize: 12, border: "1px solid #ddd", padding: 6, marginTop: 6 }}>
                    <strong>{v.name}</strong> • level: {v.level ?? "-"} • alat: {v.tools ?? "-"}
                </div>
            ))}
        </div>
    )
}

const btn: React.CSSProperties = { padding: "6px 10px", background: "#111", color: "#fff", borderRadius: 6, fontSize: 12, textDecoration: "none" }
const btnGhost: React.CSSProperties = { padding: "6px 10px", background: "#fff", border: "1px solid #111", borderRadius: 6, fontSize: 12 }
const pre: React.CSSProperties = { fontSize: 10, overflow: "auto", background: "#f5f5f5", padding: 8 }
