"use strict";

import Hapi, { Request } from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";
import { playFactory } from "./game";
import secrets from "../secrets";

export let server: Server;
export let spotify: SpotifyWebApi;

// https://www.solarwinter.net/using-typescript-with-hapi/
export const init = async function (): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: "127.0.0.1",
    });

    // Log in first.
    spotify = new SpotifyWebApi(secrets);
    const { access_token } = await spotify.getTemporaryAppTokens();
    spotify.setAccessToken(access_token);

    server.route({
        method: "GET",
        path: "/userId/{userId}",
        handler: playFactory(spotify),
    });

    return server;
};

export const start = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

process.on("unhandledRejection", (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});

init().then(() => start());
