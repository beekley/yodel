"use strict";

import { SpotifyWebApi } from "spotify-web-api-ts";
import { Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";

export interface TrackOption {
    id: String;
    name: String;
    artists: String[];
    genres: String[];
    year: Number;
}

export interface Round {
    previewUrl: String;
    answerId: String;
    trackOptions: TrackOption[];
}

export async function getTracksForUser(
    spotify: SpotifyWebApi,
    userId: string
): Promise<Track[]> {
    const { items } = await spotify.playlists.getUserPlaylists(userId);
    const playlists: Array<Playlist> = await Promise.all(
        items.map(async function (p): Promise<Playlist> {
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

    return tracks;
}

export async function getTrackOptions(
    spotify: SpotifyWebApi,
    tracks: Track[]
): Promise<TrackOption[]> {
    return await Promise.all(
        tracks.map(async function (track: Track): Promise<TrackOption> {
            const trackOption: TrackOption = {
                id: track.id,
                name: track.name,
                year: new Date(track.album.release_date).getFullYear(),
                artists: track.artists.map(function (artist): String {
                    return artist.name;
                }),
                genres: [],
            };
            return trackOption;
        })
    );
}

export function pickTrack(tracks: Track[]): Track {
    const track: Track = tracks[Math.floor(Math.random() * tracks.length)];
    return track;
}
