import Elysia, { t } from "elysia";

// Free Overpass, POST-only tanpa query untuk cegah abuse
// Radius tidak difilter client: server ambil 50km (cukup untuk metro) lalu sort nearest — "berapapun jaraknya, tampilkan terdekat"
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 50000; // 50km fixed internal, tidak diekspos
const LIMIT = 20;
const TIMEOUT_S = 15;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildOverpassQuery(kind: "gym" | "shop", lat: number, lng: number): string {
    const around = `around:${RADIUS_M},${lat},${lng}`;
    if (kind === "gym") {
        return `[out:json][timeout:${TIMEOUT_S}];(node["leisure"="fitness_centre"](${around});way["leisure"="fitness_centre"](${around});node["amenity"="gym"](${around});way["amenity"="gym"](${around});node["sport"="fitness"](${around}););out center ${LIMIT};`;
    }
    // shop
    return `[out:json][timeout:${TIMEOUT_S}];(node["shop"="sports"](${around});way["shop"="sports"](${around});node["shop"="nutrition_supplements"](${around});way["shop"="nutrition_supplements"](${around});node["shop"="supplement"](${around}););out center ${LIMIT};`;
}

type OverpassElement = {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
};

async function queryOverpass(kind: "gym" | "shop", lat: number, lng: number) {
    const query = buildOverpassQuery(kind, lat, lng);
    const url = `${OVERPASS_URL}?data=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
        headers: { "User-Agent": "FitHome/1.0 (+https://fithome.local)", Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_S * 1000 + 2000),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Overpass ${res.status}: ${txt.slice(0, 300)}`);
    }
    const json = (await res.json()) as { elements: OverpassElement[] };
    const elements = json.elements ?? [];

    const mapped = elements
        .map((el) => {
            const plat = el.lat ?? el.center?.lat;
            const plng = el.lon ?? el.center?.lon;
            if (plat == null || plng == null) return null;
            const name = el.tags?.name ?? (kind === "gym" ? "Gym" : "Toko Olahraga");
            const address = [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || undefined;
            return {
                id: `${el.type}/${el.id}`,
                name,
                lat: plat,
                lng: plng,
                address,
                tags: el.tags,
                distanceKm: Number(haversineKm(lat, lng, plat, plng).toFixed(3)),
                kind,
            };
        })
        .filter(Boolean) as NonNullable<ReturnType<typeof haversineKm> extends number ? any : never>[];

    // sort by distance, limit
    mapped.sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    return mapped.slice(0, LIMIT);
}

const bodySchema = t.Object({
    lat: t.Number({ minimum: -90, maximum: 90 }),
    lng: t.Number({ minimum: -180, maximum: 180 }),
});

export const gymRoute = new Elysia({ prefix: "/gym" })
    .post(
        "/nearby",
        async ({ body, set }) => {
            try {
                const data = await queryOverpass("gym", body.lat, body.lng);
                return { success: true as const, data };
            } catch (e) {
                set.status = 502;
                return { success: false as const, message: e instanceof Error ? e.message : "Overpass error" };
            }
        },
        {
            body: bodySchema,
            detail: {
                summary: "Cari gym terdekat (free OSM)",
                description: `POST-only tanpa query (radius fixed ${RADIUS_M}m server-side). Flow: browser getCurrentPosition -> POST {lat,lng} -> return sorted by distance.`,
            },
        }
    )
    .post(
        "/shop",
        async ({ body, set }) => {
            try {
                const data = await queryOverpass("shop", body.lat, body.lng);
                return { success: true as const, data };
            } catch (e) {
                set.status = 502;
                return { success: false as const, message: e instanceof Error ? e.message : "Overpass error" };
            }
        },
        {
            body: bodySchema,
            detail: {
                summary: "Cari toko olahraga terdekat (free OSM)",
                description: `POST-only tanpa query (radius fixed ${RADIUS_M}m server-side). Flow sama dengan /nearby.`,
            },
        }
    );
