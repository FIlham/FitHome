import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { newsKeys } from '../../lib/query'
import { api } from '../../lib/treaty'
import { formatRelative } from '../../lib/format'

export const Route = createFileRoute('/_protected/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const {
        data: news,
        isPending: loading,
        isError,
        error,
    } = useQuery({
        queryKey: newsKeys.all,
        queryFn: async () => {
            const res = await api.news.all.get({ query: { limit: 5 } })
            if (res.error) {
                const msg = (res.error.value as any)?.message ?? (res.error as any).message ?? JSON.stringify(res.error)
                throw new Error(msg)
            }
            if (!res.data.success) throw new Error((res.data as any).message ?? "News not found")
            return res.data.data
        }
    })

    if (isError && error.message) return <h1>Error: {error.message}</h1>

    return (
        <>
            <Link to='/profile'>Go Profile</Link>
            <br />
            <Link to='/latihan'>Mulai Latihan</Link>

            <h1>News</h1>
            {
                (loading ? <h1>Loading news</h1> : news && news.length === 0 ? <h1>No news</h1> : news && news.map((x, i) => (
                    <div>
                        <h1>{x.title}</h1>
                        <p>oleh admin</p>
                        <p>{formatRelative(x.created_at)}</p>
                        <p>{x.content.substring(0, 100)}...</p>
                    </div>
                )))
            }

        </>
    )
}
