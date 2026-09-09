import Elysia from "elysia";
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";

export const aiRoute = new Elysia({ prefix: "/ai" }).post(
    "/chat",
    async ({ request, set }) => {
        if (!process.env.OPENROUTER_API_KEY) {
            set.status = 500;
            return {
                success: false as const,
                message: "OPENROUTER_API_KEY not configured. Set di .env",
            };
        }

        const body: any = await request.json().catch(() => ({}));
        const messages = body.messages ?? body.message ?? [];

        const normalizedMessages = Array.isArray(messages)
            ? messages.map((m: any) => {
                if (m.content) return m;
                if (m.parts) {
                    const text = m.parts.filter((p: any) => p.type === "text").map((p: any) => p.content).join("\n");
                    return { role: m.role, content: text };
                }
                return m;
            })
            : [];

        try {
            const adapter = createOpenRouterText(
                ((process.env.OPENROUTER_MODEL as string) ?? "openai/gpt-4o-mini") as any,
                process.env.OPENROUTER_API_KEY!,
                {
                    httpReferer: process.env.ORIGIN ?? "http://localhost:3000",
                    appTitle: "FitHome AI Coach",
                }
            );

            const stream = chat({
                adapter,
                messages: normalizedMessages,
                systemPrompts: [
                    "Kamu adalah FitHome AI Coach — asisten workout ramah berbahasa Indonesia.",
                    "Tugas: beri saran latihan di rumah (arm/leg), jelaskan variasi easy/medium/hard/custom, hitung sets/reps/rests, motivasi streak, dan jawab seputar fitness.",
                    "Gunakan konteks: user punya streak poin (day3=1 poin, day4=2 dst), workout via FitHome.",
                    "Jawab ringkas, actionable, sertakan peringatan safety jika perlu. Jangan beri diagnosis medis berat.",
                ],
            });

            // Elysia bisa return Response langsung (SSE stream)
            return toServerSentEventsResponse(stream);
        } catch (error) {
            set.status = 500;
            return {
                success: false as const,
                message: error instanceof Error ? error.message : "AI error",
            };
        }
    },
    {
        detail: {
            summary: "AI Coach chat streaming",
            description: "TanStack AI + OpenRouter, dipakai useChat fetchServerSentEvents",
        },
    }
);
