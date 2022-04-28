"use strict";

import { SpotifyWebApi } from "spotify-web-api-ts";
import { Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";

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

    console.log(await spotify.artists.getArtist(tracks[100].artists[0].id))

    return tracks;
}

export function pickTrack(tracks: Track[]): Track {
    const track: Track = tracks[Math.floor(Math.random() * tracks.length)];
    return track;
}
