<template>
    <div id="app">
        <!-- TODO: make the v-if a computed property -->
        <button v-if="answerTrackIds.length == 0" @click="getTracks">get tracks</button>
        <div id="game" v-if="answerTrackIds.length > 0">
            <div>Guess count: {{ guessCount }} / {{ $props.answerCount }}</div>
            <div>Correct count: {{ correctCount }} / {{ $props.answerCount }}</div>
            <!-- `v-for` is 1-indexed but answerTrackIds is 0-indexed. -->
            <Track
                v-for="i in currentAnswerIndex + 1"
                :key="answerTrackIds[i - 1]"
                :trackId="answerTrackIds[i - 1]"
                :track="tracks.get(answerTrackIds[i - 1])"
                :tracks="Array.from(tracks.keys())"
                @correctGuess="onCorrectGuess"
                @incorrectGuess="onIncorrectGuess"
            />
        </div>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent, onMounted } from "vue";
import Track from "./components/Track.vue";
import type { TrackInfo } from "../../api/src/types";

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
        };
    },
    methods: {
        async getTracks() {
            // Fetch from backend.
            const data: TrackInfo[] = (await axios.get("/userId/129048914")).data;

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
        },
        onGuess() {
            this.guessCount += 1;
            console.log("Incrementing guess count to", this.guessCount);
        },
        onCorrectGuess() {
            this.correctCount += 1;
            this.currentAnswerIndex += 1;
            if (
                this.currentAnswerIndex >= this.$props.answerCount ||
                this.guessCount >= this.$props.answerCount
            ) {
                // TODO: tell the track components to stop playing.
                console.log("End of game.");
                return;
            }
            console.log(
                "Correct guess. Incrementing song index to",
                this.currentAnswerIndex
            );
            this.onGuess();
        },
        onIncorrectGuess() {
            console.log("Incorrect guess.");
            this.onGuess();
        },
    },
});
</script>