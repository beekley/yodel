import * as functions from "firebase-functions";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { play } from "../../api/src/game";
import secrets from "../../api/secrets";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const api = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    const userId = request.query["userId"] as string;

    // Log in first.
    const spotify = new SpotifyWebApi(secrets);
    const { access_token } = await spotify.getTemporaryAppTokens();
    spotify.setAccessToken(access_token);

    // Cache on the client side for longer.
    const browserCacheSeconds = 60 * 60;
    const cdnCacheSeconds = 5 * 60;
    response.set(
        "Cache-Control",
        `public, max-age=${browserCacheSeconds}, s-maxage=${cdnCacheSeconds}`
    );

    response.send(await play(spotify, userId));
});
