<template>
    <div id="app">
        <!-- TODO: make the v-if a computed property. -->
        <div v-if="answerTrackIds.length == 0">
            <input v-model="userId" />
            <button @click="getTracks" :disabled="fetchingTracks">Play!</button>
        </div>
        <!-- TODO: Move game to its own component. -->
        <div id="game" v-if="answerTrackIds.length > 0">
            <div>Time remaining: {{ timeRemaining }}</div>
            <div>Guess count: {{ guessCount }} / {{ $props.answerCount }}</div>
            <div>Correct count: {{ correctCount }} / {{ $props.answerCount }}</div>
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
import axios from "axios";
import { defineComponent, onMounted } from "vue";
import Track from "./components/Track.vue";
import type { TrackInfo } from "../../api/src/types";
import globalState, { State } from "./state";

const gameDurationSeconds = 60;

export default defineComponent({
    name: "App",
    components: {
        Track,
    },
    props: {
        answerCount: {
            type: Number,
            default: 20,
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
            const r = gameDurationSeconds - this.time;
            if (r <= 0) {
                clearInterval(this.timer);
                globalState.state = State.After;
                return "0:00";
            }
            const m = Math.floor(r / 60);
            let s = r % 60;
            return `${m}:${s < 10 ? "0" : ""}${s}`;
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
            if (data.length < this.answerCount) {
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