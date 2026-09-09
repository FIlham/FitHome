import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { communityKeys } from '../../lib/query'
import { listCommunityMessages, sendCommunityMessage } from '../../lib/community.functions'
import { Markdown } from '../../components/Markdown'
import { formatRelative } from '../../lib/format'

export const Route = createFileRoute('/_protected/community')({
    component: RouteComponent,
})

function RouteComponent() {
    const qc = useQueryClient()
    const [input, setInput] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const q = useQuery({
        queryKey: communityKeys.list(50),
        queryFn: () => listCommunityMessages({ data: { limit: 50 } }),
        refetchInterval: 3000,
        refetchIntervalInBackground: false,
    })

    const mut = useMutation({
        mutationFn: (content: string) => sendCommunityMessage({ data: { content } }),
        onSuccess: () => {
            setInput('')
            setShowPreview(false)
            qc.invalidateQueries({ queryKey: communityKeys.all })
            // scroll after invalidate
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        },
    })

    // auto scroll on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [q.data?.length])

    const canSend = input.trim().length > 0 && input.trim().length <= 2000 && !mut.isPending

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSend) return
        mut.mutate(input.trim())
    }

    return (
        <div className="flex min-h-[100dvh] flex-col bg-[#0f1115] text-zinc-100">
            <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0f1115]/90 backdrop-blur">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800">← Dashboard</Link>
                        <h1 className="text-sm font-bold">Komunitas <span className="rounded-full bg-[#ffc107] px-2 py-0.5 text-[10px] font-black text-black">MVP</span></h1>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span className={`h-2 w-2 rounded-full ${q.isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                        {q.isFetching ? 'syncing...' : 'live 3s polling'}
                        <span className="hidden sm:inline">• retensi 7 hari • markdown</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">
                <p className="mb-3 text-xs text-zinc-500">Satu global room. Polling 3s pakai <code className="rounded bg-zinc-800 px-1">createServerFn</code> — tanpa WS, retensi 7 hari lazy-purge di server. Tanpa moderasi di MVP.</p>

                <div
                    ref={listRef}
                    className="flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-[#181b20] p-3 sm:p-4"
                    style={{ minHeight: 380, maxHeight: '60vh', overflowY: 'auto' }}
                >
                    {q.isPending && <p className="py-8 text-center text-sm text-zinc-400">Loading chat...</p>}
                    {q.isError && <p className="py-8 text-center text-sm text-red-400">{(q.error as Error).message} <button onClick={() => q.refetch()} className="ml-2 underline">retry</button></p>}
                    {q.data?.length === 0 && !q.isPending && (
                        <div className="py-12 text-center">
                            <p className="text-2xl">💬</p>
                            <p className="mt-2 text-sm font-semibold">Belum ada pesan</p>
                            <p className="text-xs text-zinc-500">Jadi yang pertama — sapa komunitas FitHome!</p>
                        </div>
                    )}
                    <div className="space-y-3">
                        {q.data?.map((m: any) => (
                            <div key={m.id} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffc107] text-xs font-black text-black">
                                    {(m.user?.name ?? '?').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-white">{m.user?.name ?? 'Unknown'}</span>
                                        <span className="text-[11px] text-zinc-500">{formatRelative(m.createdAt)} • {new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="prose prose-invert mt-1 max-w-none text-sm leading-relaxed text-zinc-100">
                                        <Markdown content={m.content} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <form onSubmit={onSubmit} className="mt-4 rounded-2xl border border-zinc-800 bg-[#181b20] p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Tulis pesan</span>
                        <button type="button" onClick={() => setShowPreview(v => !v)} className="rounded-full border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800">
                            {showPreview ? '✎ Edit' : '👁 Preview markdown'}
                        </button>
                    </div>

                    {!showPreview ? (
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="**bold**, *italic*, `code`, [link](url), ```codeblock```, | tabel | — Enter untuk baris baru"
                            rows={3}
                            maxLength={2000}
                            className="mt-2 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-[#ffc107] focus:ring-1 focus:ring-[#ffc107]"
                        />
                    ) : (
                        <div className="mt-2 min-h-[76px] rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-3">
                            {input.trim() ? <Markdown content={input} /> : <p className="text-xs text-zinc-500">Kosong — tulis dulu di mode edit</p>}
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                        <span className={`text-[11px] ${input.length > 1800 ? 'text-amber-400' : 'text-zinc-500'}`}>{input.length}/2000 {input.length === 0 && '• Enter untuk kirim'}</span>
                        <div className="flex items-center gap-2">
                            {mut.isError && <span className="max-w-[180px] truncate text-xs text-red-400">{(mut.error as Error).message}</span>}
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="rounded-xl bg-[#ffc107] px-5 py-2 text-sm font-bold text-black hover:bg-[#e0a800] disabled:opacity-40"
                            >
                                {mut.isPending ? 'Mengirim...' : 'Kirim →'}
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-500">Throttle 2 detik per user (server). Spam/filter belum ada — MVP.</p>
                </form>
            </main>
        </div>
    )
}
