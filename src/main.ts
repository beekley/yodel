'use strict';

import Hapi, { Request } from "@hapi/hapi";
import { Server } from "@hapi/hapi";

export let server: Server;

export const init = async function(): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: '127.0.0.1',
    });

    // Routes will go here
    server.route({
        method: "GET",
        path: "/",
        handler: index,
    });

    return server;
};

export const start = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

function index(request: Request): string {
    console.log("Processing request", request.info.id);
    return "Hello! Nice to have met you.";
}

process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});

init().then(() => start());