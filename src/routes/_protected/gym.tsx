import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { api } from '../../lib/treaty'

export const Route = createFileRoute('/_protected/gym')({
    component: RouteComponent,
})

type Loc = { lat: number; lng: number }
type GymItem = { id: string; name: string; lat: number; lng: number; distanceKm: number; address?: string; tags?: any; kind: string }

function RouteComponent() {
    const [loc, setLoc] = useState<Loc | null>(null)
    const [gyms, setGyms] = useState<GymItem[]>([])
    const [shops, setShops] = useState<GymItem[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [geoErr, setGeoErr] = useState<string | null>(null)

    const fetchFor = async (lat: number, lng: number) => {
        setLoading(true); setErr(null)
        try {
            const [rGym, rShop] = await Promise.all([
                api.gym.nearby.post({ lat, lng } as any),
                api.gym.shop.post({ lat, lng } as any),
            ])
            if (rGym.error) throw new Error((rGym.error.value as any)?.message ?? JSON.stringify(rGym.error))
            if (!rGym.data.success) throw new Error((rGym.data as any).message)
            if (rShop.error) throw new Error((rShop.error.value as any)?.message ?? JSON.stringify(rShop.error))
            if (!rShop.data.success) throw new Error((rShop.data as any).message)
            setGyms((rGym.data as any).data ?? [])
            setShops((rShop.data as any).data ?? [])
        } catch (e: any) {
            setErr(e.message ?? String(e))
        } finally { setLoading(false) }
    }

    const handleLocate = () => {
        setGeoErr(null)
        if (!navigator.geolocation) { setGeoErr("Geolocation tidak didukung browser"); return }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setLoc(c)
                fetchFor(c.lat, c.lng)
            },
            (e) => setGeoErr(e.message + " (pastikan Allow Location & HTTPS)"),
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const Item = ({ it }: { it: GymItem }) => (
        <div style={{ border: "1px solid #ddd", padding: 8, marginTop: 8 }}>
            <strong>{it.name}</strong> <span style={{ fontSize: 12, opacity: 0.6 }}>— {it.distanceKm} km</span>
            <div style={{ fontSize: 12 }}>lat:{it.lat.toFixed(5)} lng:{it.lng.toFixed(5)} {it.address ? `• ${it.address}` : ""}</div>
            <details><summary style={{ fontSize: 11 }}>raw tags</summary><pre style={{ fontSize: 10, overflow: "auto" }}>{JSON.stringify(it.tags ?? it, null, 2)}</pre></details>
            <a href={`https://www.openstreetmap.org/?mlat=${it.lat}&mlon=${it.lng}#map=17/${it.lat}/${it.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Lihat di OSM →</a>
        </div>
    )

    return (
        <div style={{ padding: 16, maxWidth: 640 }}>
            <Link to="/dashboard">← Dashboard</Link>
            <h1>Lokasi & Alat Gym (plain)</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>Flow: browser getCurrentPosition → POST /api/gym/nearby & /shop body {"{lat,lng}"} (tanpa query, radius 50km server-side, sort nearest). Free OSM Overpass.</p>

            <button onClick={handleLocate} disabled={loading} style={{ padding: "8px 14px", marginTop: 8 }}>{loading ? "Mencari..." : loc ? "Refresh lokasi" : "Cari terdekat (pakai lokasi device)"}</button>
            {loc && <p style={{ fontSize: 12 }}>Lokasi device: {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</p>}
            {geoErr && <p style={{ color: "crimson", fontSize: 12 }}>Geo error: {geoErr}</p>}
            {err && <p style={{ color: "crimson", fontSize: 12 }}>API error: {err}</p>}

            <h2 style={{ marginTop: 16 }}>Gym terdekat ({gyms.length})</h2>
            {gyms.length === 0 ? <p style={{ fontSize: 12, opacity: 0.6 }}>{loading ? "Loading..." : "Belum ada data — klik cari di atas"}</p> : gyms.map(g => <Item key={g.id} it={g} />)}

            <h2 style={{ marginTop: 20 }}>Toko alat olahraga terdekat ({shops.length})</h2>
            {shops.length === 0 ? <p style={{ fontSize: 12, opacity: 0.6 }}>{loading ? "Loading..." : "Belum ada data"}</p> : shops.map(s => <Item key={s.id} it={s} />)}

            <p style={{ fontSize: 11, opacity: 0.5, marginTop: 16 }}>Data OSM kadang tidak lengkap — kosong = tidak ada mapping di 50km. Endpoint: POST /api/gym/nearby , POST /api/gym/shop</p>
        </div>
    )
}
