<template>
    <div id="app">
        <p>Yodel: How well do you know your music.</p>
        <p>
            You have {{ $props.gameDurationSeconds }} seconds to guess as many tracks from
            your library as you can.
        </p>
        <!-- TODO: make the v-if a computed property. -->
        <div v-if="answerTrackIds.length == 0">
            <p>Enter Spotify ID to start playing:</p>
            <input v-model="userId" />
            <button @click="getTracks" :disabled="fetchingTracks">Play!</button>
        </div>
        <!-- TODO: Move game to its own component. -->
        <div id="game" v-if="answerTrackIds.length > 0">
            <div>Time remaining: {{ timeRemaining }}</div>
            <div>Track count: {{ trackCount }}</div>
            <div>Guess count: {{ guessCount }}</div>
            <div>Correct count: {{ correctCount }}</div>
            <!-- `v-for` is 1-indexed but answerTrackIds is 0-indexed. -->
            <Track
                v-for="i in Math.min(
                    currentAnswerIndex + 1,
                    $props.answerCount || Infinity
                )"
                :key="answerTrackIds[i - 1]"
                :trackId="answerTrackIds[i - 1]"
                :track="tracks.get(answerTrackIds[i - 1])"
                :tracks="tracks"
                @correctGuess="onCorrectGuess"
                @incorrectGuess="onIncorrectGuess"
                @skip="onSkip"
            />
        </div>
    </div>
</template>

<script lang="ts">
// TODO: split this up. This file is getting too broad.
import axios from "axios";
import { defineComponent, onMounted } from "vue";
import Track from "./components/Track.vue";
import type { TrackInfo } from "../../api/src/types";
import globalState, { State } from "./state";

interface GameHistory {
    timestamp: number;
    trackCount: number;
    guessCount: number;
    correctCount: number;
}

export default defineComponent({
    name: "App",
    components: {
        Track,
    },
    props: {
        answerCount: {
            type: Number,
            default: 50,
        },
        gameDurationSeconds: {
            type: Number,
            default: 5,
        },
    },
    data() {
        const answerTrackIds: string[] = [];
        return {
            // All tracks for the players.
            tracks: new Map<string, TrackInfo>(),
            // List of 20 answers. These are keys for the tracks map.
            answerTrackIds,
            currentAnswerIndex: 0,
            previewUrl: "",
            searchId: "",
            guessCount: 0,
            correctCount: 0,
            userId: "129048914",
            fetchingTracks: false,
            time: 0, // Seconds
            timer: 0, // Interval
        };
    },
    computed: {
        timeRemaining(): string {
            const r = this.gameDurationSeconds - this.time;
            if (r <= 0) {
                clearInterval(this.timer);
                this.endGame();
                return "0:00";
            }
            const m = Math.floor(r / 60);
            let s = r % 60;
            return `${m}:${s < 10 ? "0" : ""}${s}`;
        },
        trackCount(): number {
            return this.currentAnswerIndex + 1;
        },
    },
    methods: {
        async getTracks() {
            this.fetchingTracks = true;
            // Fetch from backend.
            const data: TrackInfo[] = (
                await axios.get(`/api/yodel?userId=${this.userId}`)
            ).data;

            // Break if not enough tracks.
            if (data.length < this.$props.answerCount) {
                console.log("Not enough tracks for user to play.");
                return;
            }

            // Generated ID for each track and store as a map.
            data.forEach((t) => {
                const compositeId = `${t.artists.map((a) => a.name).join(", ")} - ${
                    t.name
                }`;
                this.tracks.set(compositeId, t);
            });

            // Add random tracks to the answer list.
            for (let i = 0; i < this.answerCount; i += 1) {
                const ids = Array.from(this.tracks.keys());
                // Don't add duplicates.
                while (true) {
                    const candidateId = ids[Math.floor(Math.random() * ids.length)];
                    console.log("Attempting to add to answers:", candidateId);
                    if (this.answerTrackIds.indexOf(candidateId) < 0) {
                        this.answerTrackIds.push(candidateId);
                        break;
                    } else console.log("duplicate answer: ", candidateId);
                }
            }
            this.fetchingTracks = false;

            // TODO: Make a button for this.
            this.startGame();
        },
        startGame() {
            this.timer = setInterval(() => {
                this.time++;
            }, 1000);
        },
        endGame() {
            console.log("Ending game");
            globalState.state = State.After;
            // Store game history.
            const gameHistories = JSON.parse(
                localStorage["gameHistories"] ?? "[]"
            ) as GameHistory[];
            const gameHistory = {
                timestamp: Math.floor(Date.now() / 1000),
                trackCount: this.trackCount,
                guessCount: this.guessCount,
                correctCount: this.correctCount,
            };
            gameHistories.push(gameHistory);
            localStorage["gameHistories"] = JSON.stringify(gameHistories);
        },
        nextTrack() {
            this.currentAnswerIndex += 1;
            if (
                this.currentAnswerIndex >= this.$props.answerCount ||
                this.guessCount >= this.$props.answerCount
            ) {
                // TODO: tell the track components to stop playing.
                console.log("End of game.");
                return;
            } else {
                console.log(
                    "Correct guess. Incrementing song index to",
                    this.currentAnswerIndex
                );
            }
        },
        onGuess() {
            this.guessCount += 1;
            console.log("Incrementing guess count to", this.guessCount);
        },
        onCorrectGuess() {
            this.correctCount += 1;
            this.onGuess();
            this.nextTrack();
        },
        onIncorrectGuess() {
            console.log("Incorrect guess.");
            this.onGuess();
        },
        onSkip() {
            console.log();
            this.nextTrack();
        },
    },
});
</script>