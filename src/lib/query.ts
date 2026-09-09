import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60, // 1 menit cache
                gcTime: 1000 * 60 * 5, // 5 menit garbage collect
                retry: 1,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}

// Query Keys - single source of truth untuk invalidasi cache
export const exerciseKeys = {
    all: ["exercises"] as const,
    detail: (id: string) => ["exercise", id] as const,
} as const;

export const streakKeys = {
    status: ["streak", "status"] as const,
    history: (limit?: number) => ["streak", "history", limit ?? 30] as const,
} as const;

export const newsKeys = {
    all: ["news", "all"] as const,
    detail: (id: string) => ["news", id] as const
} as const

export const communityKeys = {
    all: ["community", "all"] as const,
    list: (limit?: number) => ["community", "list", limit ?? 50] as const,
} as const