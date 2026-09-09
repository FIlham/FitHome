import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { streakKeys } from '../../lib/query'
import { api } from '../../lib/treaty'
import { formatDate } from '../../lib/format'

export const Route = createFileRoute('/_protected/streak')({
    component: RouteComponent,
})

function RouteComponent() {
    const qc = useQueryClient()

    const statusQ = useQuery({
        queryKey: streakKeys.status,
        queryFn: async () => {
            const res = await api.streak.status.get()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message)
            return res.data.data as any
        },
    })

    const historyQ = useQuery({
        queryKey: streakKeys.history(30),
        queryFn: async () => {
            const res = await api.streak.history.get({ query: { limit: "30" } as any })
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message)
            return res.data.data as any[]
        },
    })

    const claim = useMutation({
        mutationFn: async () => {
            const res = await api.streak.claim.post()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            // 409 already claimed returns success:false — treat as error with message
            if (!res.data.success) throw new Error((res.data as any).message ?? "Gagal claim")
            return res.data.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: streakKeys.status })
            qc.invalidateQueries({ queryKey: streakKeys.history() })
        },
    })

    return (
        <div style={{ padding: 16, maxWidth: 640 }}>
            <Link to="/dashboard">← Dashboard</Link>
            <h1>Streak (plain)</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>GET /api/streak/status + /history + POST /claim (1x/hari WIB, day3=1pt). Data mentah, styling terakhir.</p>

            {statusQ.isPending ? <p>Loading status...</p> : statusQ.isError ? <p style={{ color: "crimson" }}>Error: {(statusQ.error as Error).message}</p> : (
                <div style={{ border: "1px solid #111", padding: 12, marginTop: 12 }}>
                    <p>Current: <strong>{statusQ.data.currentStreak}</strong> hari</p>
                    <p>Longest: {statusQ.data.longestStreak} hari • Total poin: {statusQ.data.totalPoints}</p>
                    <p style={{ fontSize: 12, opacity: 0.6 }}>Last: {statusQ.data.lastWorkoutDate ? formatDate(statusQ.data.lastWorkoutDate) : "-"}</p>
                    <button onClick={() => claim.mutate()} disabled={claim.isPending} style={{ marginTop: 8, padding: "6px 12px" }}>{claim.isPending ? "Claim..." : "Claim hari ini (test)"}</button>
                    {claim.isError && <p style={{ color: "crimson", fontSize: 12 }}>{(claim.error as Error).message}</p>}
                    {claim.isSuccess && <pre style={{ fontSize: 11, background: "#f5f5f5", padding: 8, marginTop: 8 }}>{JSON.stringify(claim.data, null, 2)}</pre>}
                    <details><summary style={{ fontSize: 11 }}>raw status</summary><pre style={{ fontSize: 10, overflow: "auto" }}>{JSON.stringify(statusQ.data, null, 2)}</pre></details>
                </div>
            )}

            <h2 style={{ marginTop: 16 }}>History (30)</h2>
            {historyQ.isPending ? <p>Loading history...</p> : historyQ.isError ? <p style={{ color: "crimson" }}>Error: {(historyQ.error as Error).message}</p> : (!historyQ.data || historyQ.data.length === 0) ? <p>Belum ada history</p> : historyQ.data.map((h: any) => (
                <div key={h.id} style={{ border: "1px solid #ddd", padding: 8, marginTop: 8, fontSize: 13 }}>
                    <span>{formatDate(h.workoutDate)}</span> — streak:{h.streakCount} poin:{h.pointsEarned}
                    <details><summary style={{ fontSize: 11 }}>raw</summary><pre style={{ fontSize: 10 }}>{JSON.stringify(h, null, 2)}</pre></details>
                </div>
            ))}
        </div>
    )
}
