"use strict";

import Hapi, { Request } from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";
import { getTrackOptions, getTracksForUser, pickTrack, Round, TrackOption } from "./game";
import secrets from "../secrets";

export let server: Server;
export let spotify: SpotifyWebApi;

// https://www.solarwinter.net/using-typescript-with-hapi/
export const init = async function (): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: "127.0.0.1",
    });

    // Routes will go here
    server.route({
        method: "GET",
        path: "/userId/{userId}",
        handler: play,
    });

    // log in first
    spotify = new SpotifyWebApi(secrets);
    const { access_token } = await spotify.getTemporaryAppTokens();
    spotify.setAccessToken(access_token);

    return server;
};

export const start = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

async function play(request: Request): Promise<Round> {
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

process.on("unhandledRejection", (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});

init().then(() => start());
