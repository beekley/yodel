"use strict";

import Hapi, { Request } from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { Playlist, Track } from "spotify-web-api-ts/types/types/SpotifyObjects";
import { getGenresFactory, playFactory } from "./game";
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
        path: "/api/yodel",
        handler: playFactory(spotify),
    });
    server.route({
        method: "GET",
        path: "/genres/{artistIds}",
        handler: getGenresFactory(spotify),
    });

    await server.register(require("@hapi/inert"));
    server.route({
        method: "GET",
        path: "/{param*}",
        handler: {
            directory: {
                path: "../client/dist",
                index: ["index.html"],
            },
        },
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
