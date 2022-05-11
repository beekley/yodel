"use strict";

import { Request } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import {
    Artist,
    Playlist,
    Track,
} from "spotify-web-api-ts/types/types/SpotifyObjects";

export interface ArtistInfo {
    id: string;
    name: string;
    // Null if genres aren't fetched yet.
    genres?: string[];
}

export interface TrackInfo {
    id: string;
    name: string;
    artists: ArtistInfo[];
    year: Number;
}

// interface Round {
//     previewUrl: string;
//     answerId: string;
//     TrackInfos: TrackInfo[];
// }

// Wrap route handler with spotify client in a closure.
export function playFactory(
    spotify: SpotifyWebApi
): (request: Request) => Promise<TrackInfo[]> {
    const cache = new Map<string, TrackInfo[]>();

    return async function (request: Request): Promise<TrackInfo[]> {
        const userId: string = request.params.userId;
        console.log("Getting playlists for userId:", userId);

        if (cache.has(userId)) {
            console.log("Cache hit.");
            return cache.get(userId)!;
        }

        try {
            const { items } = await spotify.playlists.getUserPlaylists(userId);
            const playlists: Array<Playlist> = await Promise.all(
                items.map(async function (p): Promise<Playlist> {
                    console.log("Getting playlist with id:", p.id);
                    return await spotify.playlists.getPlaylist(p.id);
                })
            );
            // Only gets the first 100 tracks of a playlist.
            // TODO: get all of them instead.
            const tracks: Array<Track> = [];
            playlists.forEach(function (p) {
                p.tracks.items.forEach((i) => {
                    if ((i.track as Track).preview_url) {
                        tracks.push(i.track as Track);
                    }
                });
            });

            const results = await Promise.all(
                tracks.map(async function (track: Track): Promise<TrackInfo> {
                    return {
                        id: track.id,
                        name: track.name,
                        year: new Date(track.album.release_date).getFullYear(),
                        artists: track.artists.map(function (artist): ArtistInfo {
                            return {
                                id: artist.id,
                                name: artist.name,
                            };
                        }),
                    };
                })
            );

            cache.set(userId, results);
            return cache.get(userId)!;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    };
}

export function getGenresFactory(
    spotify: SpotifyWebApi
): (request: Request) => Promise<string[]> {
    return async function (request: Request): Promise<string[]> {
        // Treat this as one string since that's what the Spotify API needs.
        const artistIds: string[] = request.params.artistIds.split(",");
        console.log("Getting genres for artistIds:", artistIds);

        // Aggregate all genres across each artist for the track.
        const genres: string[] = [];
        try {
            const details: Artist[] = await spotify.artists.getArtists(artistIds);
            details.forEach((artist: Artist) => {
                genres.push(...artist.genres);
            });
        }
        catch(e) {
            console.log("Failed to get genres for artists ", artistIds, ":", e);
            // return await spotify.artists.getArtist(artist.id);
        }
        return genres;
    };
}

// function pickTrack(tracks: Track[]): Track {
//     const track: Track = tracks[Math.floor(Math.random() * tracks.length)];
//     return track;
// }
