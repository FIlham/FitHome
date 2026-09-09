import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { newsKeys } from '../../../lib/query'
import { api } from '../../../lib/treaty'
import { formatRelative } from '../../../lib/format'

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

    if (isError && error.message) return <h1>Error: {error.message}</h1>
    if (loading) return <h1>Loading...</h1>

    return <div>
        <h1>{news?.title}</h1>
        <p>Dibuat oleh admin {formatRelative(news?.created_at)}</p>
        <br />
        <p>{news?.content}</p>
    </div>
}
