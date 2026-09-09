import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsKeys } from '../../lib/query'
import { api } from '../../lib/treaty'
import { formatRelative } from '../../lib/format'

export const Route = createFileRoute('/_protected/news')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: news, isPending: loading, isError, error } = useQuery({
        queryKey: newsKeys.all,
        queryFn: async () => {
            const res = await api.news.all.get({ query: { limit: 20 } })
            if (res.error) {
                const msg = (res.error.value as any)?.message ?? (res.error as any).message ?? JSON.stringify(res.error)
                throw new Error(msg)
            }
            if (!res.data.success) throw new Error((res.data as any).message ?? "Gagal load news")
            return res.data.data
        },
    })

    if (isError) return <div style={{ padding: 16 }}>Error: {(error as Error).message}</div>
    if (loading) return <div style={{ padding: 16 }}>Loading news...</div>

    return (
        <div style={{ padding: 16, maxWidth: 640 }}>
            <Link to="/dashboard">← Dashboard</Link>
            <h1>News (plain)</h1>
            <p style={{ opacity: 0.6, fontSize: 12 }}>GET /api/news/all?limit=20 via treaty. Data mentah, styling terakhir.</p>
            {(!news || news.length === 0) ? <p>No news</p> : news.map((n: any) => (
                <div key={n.id} style={{ border: "1px solid #ddd", padding: 12, marginTop: 12 }}>
                    <h3 style={{ margin: 0 }}>{n.title}</h3>
                    <p style={{ fontSize: 12, opacity: 0.6 }}>{formatRelative(n.created_at)} • {new Date(n.created_at).toLocaleString("id-ID")}</p>
                    <p style={{ fontSize: 14 }}>{n.content?.substring(0, 200)}...</p>
                    <Link to="/news/$newsId" params={{ newsId: n.id }}>Lihat detail →</Link>
                    <details style={{ marginTop: 8 }}><summary style={{ fontSize: 12 }}>raw</summary><pre style={{ fontSize: 11, overflow: "auto" }}>{JSON.stringify(n, null, 2)}</pre></details>
                </div>
            ))}
        </div>
    )
}
