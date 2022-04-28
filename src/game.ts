"use strict";

import { Request } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { Artist, Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";

interface TrackOption {
    id: String;
    name: String;
    artists: String[];
    genres: String[];
    year: Number;
}

interface Round {
    previewUrl: String;
    answerId: String;
    trackOptions: TrackOption[];
}

// Wrap route handler with spotify client in a closure.
export function playFactory(spotify: SpotifyWebApi): (request: Request) => Promise<Round> {
    return async function play(request: Request): Promise<Round> {
        const userId: string = request.params.userId;
        console.log("Processing request", userId);

        const userTracks: Track[] = await getTracksForUser(spotify, "129048914");
        const trackOptions: TrackOption[] = await getTrackOptions(spotify, userTracks);
        const answer: Track = pickTrack(userTracks);
        const round: Round = {
            answerId: answer.id,
            previewUrl: answer.preview_url || "no preview URL found",
            trackOptions,
        }

        return round;
    }
}

async function getTracksForUser(
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

async function getTrackOptions(
    spotify: SpotifyWebApi,
    tracks: Track[]
): Promise<TrackOption[]> {
    return await Promise.all(
        tracks.map(async function (track: Track): Promise<TrackOption> {
            // Aggregate all genres across each artist for the track.
            const genres: String[] = []
            // TODO: fix this with respect to rate limiting.
            // await Promise.all(track.artists.map(async function (artist): Promise<Artist> {
            //     try {
            //         const details: Artist = await spotify.artists.getArtists(artist.id);
            //         genres.push(...details.genres);
            //         return details;
            //     }
            //     catch(e) {
            //         console.log(e);
            //         return await spotify.artists.getArtist(artist.id);
            //     }
            // }));
            const trackOption: TrackOption = {
                id: track.id,
                name: track.name,
                year: new Date(track.album.release_date).getFullYear(),
                artists: track.artists.map(function (artist): String {
                    return artist.name;
                }),
                genres,
            };
            return trackOption;
        })
    );
}

function pickTrack(tracks: Track[]): Track {
    const track: Track = tracks[Math.floor(Math.random() * tracks.length)];
    return track;
}
