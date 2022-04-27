"use strict";

import Hapi, { Request } from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { getTracksForUser } from "./game";
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
    path: "/",
    handler: index,
  });

  // log in first
  spotify = new SpotifyWebApi(secrets);
  const { access_token } = await spotify.getTemporaryAppTokens();
  spotify.setAccessToken(access_token);

  console.log(await getTracksForUser(spotify, "129048914"));

  return server;
};

export const start = async function (): Promise<void> {
  console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
  return server.start();
};

async function index(request: Request): Promise<string> {
  console.log("Processing request", request.info.id);
  return "Hello! Nice to have met you.";
}

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});

init().then(() => start());
