import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { newsKeys } from '../../../lib/query'
import { api } from '../../../lib/treaty'
import { formatRelative } from '../../../lib/format'
import { Markdown } from '../../../components/Markdown'

export const Route = createFileRoute('/_protected/news/$newsId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { newsId } = Route.useParams()
    const {
        data: news,
        isPending: loading,
        error,
        isError
    } = useQuery({
        queryKey: newsKeys.detail(newsId),
        queryFn: async () => {
            const res = await api.news({ newsId }).get()
            if (res.error) {
                const msg = (res.error.value as any)?.message ?? (res.error as any).message ?? JSON.stringify(res.error)
                throw new Error(msg)
            }
            if (!res.data.success || !res.data.data) throw new Error((res.data as any).message ?? "News not found")
            return res.data.data
        }
    })

    if (isError && error.message) return <div style={{ padding: 16 }}><Link to="/news">← Kembali</Link><h1 style={{ color: 'crimson' }}>Error: {error.message}</h1></div>
    if (loading) return <div style={{ padding: 16 }}>Loading...</div>
    if (!news) return <div style={{ padding: 16 }}><Link to="/news">← Kembali</Link><p>News tidak ditemukan</p></div>

    return (
        <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
            <Link to="/news" style={{ fontSize: 13, textDecoration: 'none' }}>← Kembali ke News</Link>
            <h1 style={{ margin: '12px 0 6px', fontSize: 26, lineHeight: 1.2 }}>{news.title}</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>Dibuat oleh admin {formatRelative(news.created_at)} • {new Date(news.created_at).toLocaleString('id-ID')}</p>
            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <Markdown content={news.content} />
        </div>
    )
}
