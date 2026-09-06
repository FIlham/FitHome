import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { exerciseKeys } from '../../lib/query'
import { api } from '../../lib/treaty'

export const Route = createFileRoute('/_protected/latihan')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: exerciseKeys.all,
        queryFn: async () => {
            const res = await api.exercise.all.get()
            if (res.error) {
                const msg = (res.error.value as any)?.message ?? (res.error as any).message ?? JSON.stringify(res.error)
                throw new Error(msg)
            }
            if (!res.data.success) throw new Error((res.data as any).message ?? "Gagal fetch latihan")
            return res.data.data
        },
    })

    if (isPending) return <div style={{ padding: 24 }}>Loading latihan...</div>
    if (isError) return <div style={{ padding: 24, color: 'red' }}>Error: {(error as Error).message} <button onClick={() => refetch()} style={{ marginLeft: 8, textDecoration: 'underline' }}>Retry</button></div>

    return <>
        <div>Berikut list latihan</div>
        {data.map((x: any, i: any) => {
            return (
                <div key={x.id ?? i}>
                    <p>nama: {x.name}</p>
                    <p>reps: {x.repetitions}</p>
                    <p>sets: {x.sets}</p>
                    <p>rests: {x.rests} minutes</p>
                    <Link to="/start-exercise/$exerciseId" params={{ exerciseId: x.id }}>Mulai Latihan</Link>
                </div>
            )
        })}
    </>
}
