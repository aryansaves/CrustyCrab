import { api } from "./client";

export interface WatchlistItem {
    _id: string;
    tmdbId: number;
    title: string;
    posterPath?: string;
    type: string;
    addedAt: string;
}

export async function addToWatchlist(data: {
    tmdbId: number;
    title: string;
    posterPath?: string;
    type?: string;
}) {
    const res = await api.post("/watchlist", data);
    return res.data;
}

export async function getWatchlist(page = 1, limit = 20) {
    const res = await api.get("/watchlist", {
        params: { page, limit }
    });
    return res.data;
}

export async function removeFromWatchlist(tmdbId: number) {
    const res = await api.delete(`/watchlist/${tmdbId}`);
    return res.data;
}

export async function checkInWatchlist(tmdbId: number): Promise<boolean> {
    const res = await api.get(`/watchlist/check/${tmdbId}`);
    return res.data.inWatchlist;
}
