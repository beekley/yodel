<template>
    <div class="trackContainer">
        <TrackPlayer :previewUrl="track?.previewUrl" v-if="isActive" />
        <div class="guesses">
            <p v-for="id in pastGuesses" :key="id">{{ id }}</p>
        </div>
        <div class="search" v-if="isActive">
            <SearchAutocomplete :items="trackList" @search-id="onSearchChange" />
            <button :disabled="!validSearchId" @click="onSubmit">submit</button>
            <button @click="onSkip">skip</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { TrackInfo } from "../../../api/src/types";
import SearchAutocomplete from "./SearchAutocomplete.vue";
import TrackPlayer from "./TrackPlayer.vue";

enum State {
    Playing,
    Correct,
    Skipped,
}

enum Closeness {
    Hit,
    Near,
    Miss,
}

interface Guess {
    id: string;
    correct: boolean;
    year: {
        closeness: Closeness;
        value: string;
    };
}

export default defineComponent({
    components: {
        TrackPlayer,
        SearchAutocomplete,
    },
    emits: ["correctGuess", "incorrectGuess", "skip"],
    props: {
        track: {
            // Looks weird, but what we have to do to use an interface as a type here.
            type: Object as () => TrackInfo,
        },
        tracks: {
            type: Object as PropType<Map<string, TrackInfo>>,
            default: () => {},
        },
        trackId: { type: String },
        // not used.
        key: {
            type: String,
        },
    },
    computed: {
        remainingTracks() {
            // TODO: implement. It should only return unguessed tracks.
        },
        validSearchId(): boolean {
            return this.trackList.indexOf(this.currentSearchId) > -1;
        },
        isActive(): boolean {
            console.log("Checking state:", this.state);
            return this.state == State.Playing;
        },
        outlineColor(): string {
            if (this.state == State.Correct) return "green";
            if (this.state == State.Skipped) return "red";
            return "black";
        },
        trackList() {
            return Array.from(this.tracks.keys());
        },
    },
    data() {
        const pastGuesses: string[] = [];
        return {
            currentSearchId: "",
            pastGuesses,
            state: State.Playing,
        };
    },
    methods: {
        checkCorrectness(): Guess {
            const searched = this.tracks.get(this.currentSearchId) || {
                year: Infinity,
                id: "",
            };
            const answer = this.track || { year: Infinity };
            const guess: Guess = {
                id: searched.id,
                correct: this.currentSearchId == this.trackId,
                year: {
                    closeness: Closeness.Miss,
                    value: searched.year.toString(),
                },
            };

            // Compare years.
            // Same year.
            if (searched.year == answer.year) guess.year.closeness = Closeness.Hit;
            // Same decade.
            const searchedDecade = Math.floor(searched.year / 10) * 10;
            const answerDecade = Math.floor(answer.year / 10) * 10;
            if (searchedDecade == answerDecade) {
                guess.year.closeness = Closeness.Near;
                guess.year.value = `${searchedDecade.toString()}s`;
            }

            return guess;
        },
        onSearchChange(searchId: string) {
            console.log("Guess entered:", searchId);
            this.currentSearchId = searchId;
        },
        onSubmit() {
            console.log("Submitting as guess:", this.currentSearchId);
            // Add to guesses.
            this.pastGuesses.push(this.currentSearchId);
            // Check if correct.
            const guess = this.checkCorrectness();
            console.log("... was it was corrrect?", guess);
            this.$emit(guess.correct ? "correctGuess" : "incorrectGuess");
            if (guess.correct) {
                this.state = State.Correct;
            }
        },
        onSkip() {
            console.log("Skipping current song:", this.trackId);
            this.pastGuesses.push(this.trackId || "");
            this.state = State.Skipped;
            this.$emit("skip");
        },
    },
});
</script>

<style scoped>
.trackContainer {
    outline: solid;
    outline-color: v-bind("outlineColor");
}
</style>
