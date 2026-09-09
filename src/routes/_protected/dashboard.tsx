import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { newsKeys, exerciseKeys, streakKeys } from '../../lib/query'
import { api } from '../../lib/treaty'
import { formatRelative } from '../../lib/format'

export const Route = createFileRoute('/_protected/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const newsQ = useQuery({
        queryKey: newsKeys.all,
        queryFn: async () => {
            const res = await api.news.all.get({ query: { limit: 5 } })
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message ?? "News not found")
            return res.data.data
        }
    })
    const streakQ = useQuery({
        queryKey: streakKeys.status,
        queryFn: async () => {
            const res = await api.streak.status.get()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message)
            return res.data.data as any
        }
    })
    const latihanQ = useQuery({
        queryKey: exerciseKeys.all,
        queryFn: async () => {
            const res = await api.exercise.all.get()
            if (res.error) throw new Error((res.error.value as any)?.message ?? JSON.stringify(res.error))
            if (!res.data.success) throw new Error((res.data as any).message)
            return res.data.data as any[]
        }
    })

    return (
        <div style={{ padding: 16, maxWidth: 640 }}>
            <h1>Dashboard (kasar)</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>Hub plain — data mentah tampil dulu, styling terakhir. Semua fetch via treaty + TanStack Query.</p>

            <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <Link to='/latihan' style={navBtn}>Latihan</Link>
                <Link to='/streak' style={navBtn}>Streak</Link>
                <Link to='/gym' style={navBtn}>Lokasi Gym/Toko</Link>
                <Link to='/news' style={navBtn}>News</Link>
                <Link to='/community' style={{ ...navBtn, background: '#111', color: '#fff' }}>Komunitas</Link>
                <Link to='/ai-coach' style={navBtn}>AI Coach</Link>
                <Link to='/profile' style={navBtn}>Profile</Link>
            </nav>

            {/* STREAK CARD */}
            <section style={card}>
                <h2 style={{ margin: 0 }}>Streak</h2>
                {streakQ.isPending ? <p style={muted}>Loading streak...</p> : streakQ.isError ? <p style={{ color: "crimson", fontSize: 12 }}>{(streakQ.error as Error).message}</p> : (
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                        <p>Current: <strong>{streakQ.data.currentStreak} hari</strong> • Longest: {streakQ.data.longestStreak} • Poin: {streakQ.data.totalPoints}</p>
                        <p style={muted}>Last: {streakQ.data.lastWorkoutDate ? formatRelative(streakQ.data.lastWorkoutDate) : "-"}</p>
                        <Link to="/streak" style={{ fontSize: 12 }}>Lihat detail streak →</Link>
                        <details><summary style={{ fontSize: 11 }}>raw</summary><pre style={pre}>{JSON.stringify(streakQ.data, null, 2)}</pre></details>
                    </div>
                )}
            </section>

            {/* LATIHAN PREVIEW */}
            <section style={card}>
                <h2 style={{ margin: 0 }}>Program Latihan</h2>
                {latihanQ.isPending ? <p style={muted}>Loading...</p> : latihanQ.isError ? <p style={{ color: "crimson", fontSize: 12 }}>{(latihanQ.error as Error).message}</p> : (
                    <div style={{ marginTop: 8 }}>
                        <p style={{ fontSize: 12, opacity: 0.7 }}>{latihanQ.data.length} program tersedia</p>
                        {latihanQ.data.slice(0, 3).map((x: any) => (
                            <div key={x.id} style={{ border: "1px solid #ddd", padding: 8, marginTop: 8 }}>
                                <strong>{x.name}</strong> <span style={muted}>• {x.sets} sets × {x.repetitions} reps • rest {x.rests}m</span>
                                <div style={{ marginTop: 4 }}><Link to="/start-exercise/$exerciseId" params={{ exerciseId: x.id }} style={{ fontSize: 12 }}>Mulai →</Link></div>
                            </div>
                        ))}
                        {latihanQ.data.length > 3 && <p style={muted}>{latihanQ.data.length - 3} program lagi...</p>}
                        <Link to="/latihan" style={{ fontSize: 12 }}>Lihat semua →</Link>
                    </div>
                )}
            </section>

            {/* GYM TEASER */}
            <section style={card}>
                <h2 style={{ margin: 0 }}>Lokasi Gym & Toko</h2>
                <p style={muted}>POST /api/gym/nearby & /shop via geolocation (50km nearest). Free OSM.</p>
                <Link to="/gym" style={{ fontSize: 12 }}>Cari terdekat →</Link>
            </section>

            {/* NEWS */}
            <section style={card}>
                <h2 style={{ margin: 0 }}>News</h2>
                {newsQ.isPending ? <p style={muted}>Loading news...</p> : newsQ.isError ? <p style={{ color: "crimson" }}>{(newsQ.error as Error).message}</p> : (!newsQ.data || newsQ.data.length === 0) ? <p style={muted}>No news</p> : newsQ.data.map((x: any) => (
                    <div key={x.id} style={{ border: "1px solid #ddd", padding: 8, marginTop: 8 }}>
                        <strong>{x.title}</strong>
                        <p style={muted}>oleh admin • {formatRelative(x.created_at)}</p>
                        <p style={{ fontSize: 13 }}>{x.content.substring(0, 100)}...</p>
                        <Link to='/news/$newsId' params={{ newsId: x.id }} style={{ fontSize: 12 }}>See more →</Link>
                    </div>
                ))}
                <Link to="/news" style={{ fontSize: 12, display: "block", marginTop: 8 }}>Semua news →</Link>
            </section>
        </div>
    )
}

const card: React.CSSProperties = { border: "1px solid #111", padding: 12, marginTop: 16, borderRadius: 8 }
const navBtn: React.CSSProperties = { padding: "6px 10px", border: "1px solid #111", borderRadius: 6, fontSize: 12, textDecoration: "none", color: "#111" }
const muted: React.CSSProperties = { fontSize: 12, opacity: 0.6 }
const pre: React.CSSProperties = { fontSize: 10, overflow: "auto", background: "#f5f5f5", padding: 8 }
