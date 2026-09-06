import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '../lib/auth.functions'

export const Route = createFileRoute('/admin')({
    component: RouteComponent,
    beforeLoad: async () => {
        const session = await getSession()
        if (!session) {
            throw redirect({ to: "/login" })
        }
        // isAdmin di-infer dari additionalFields `src/lib/auth.ts:8`
        if (!session.user.isAdmin) {
            throw redirect({ to: "/" })
        }
        return { user: session.user }
    }
})

function RouteComponent() {
    return <div>Hello "/admin"!</div>
}
