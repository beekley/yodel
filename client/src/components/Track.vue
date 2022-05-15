<template>
    <div class="trackContainer">
        {{ $props.track?.name }}
        <TrackPlayer :previewUrl="track?.previewUrl" />
        <div class="guesses">
            <p v-for="id in pastGuesses" :key="id">{{ id }}</p>
        </div>
        <div class="search" v-if="isActive">
            <SearchAutocomplete :items="tracks" @search-id="onSearchChange" />
            <button @click="onSubmit">submit</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { TrackInfo } from "../../../api/src/types";
import SearchAutocomplete from "./SearchAutocomplete.vue";
import TrackPlayer from "./TrackPlayer.vue";

export default defineComponent({
    components: {
        TrackPlayer,
        SearchAutocomplete,
    },
    emits: ["correctGuess", "incorrectGuess"],
    props: {
        track: {
            // Looks weird, but what we have to do to use an interface as a type here.
            type: Object as () => TrackInfo,
        },
        tracks: {
            type: Array,
            default: () => [],
        },
        trackId: { type: String },
        // not used.
        key: {
            type: String,
        },
    },
    data() {
        const pastGuesses: string[] = [];
        return {
            currentSearchId: "",
            isActive: true, // false once the correct guess has been made.
            pastGuesses,
        };
    },
    methods: {
        onSearchChange(searchId: string) {
            // Check for validity.
            if (this.tracks.indexOf(searchId) < 0) {
                return;
            }
            console.log("Valid guess entered:", searchId);
            this.currentSearchId = searchId;
        },
        onSubmit() {
            console.log("Submitting as guess:", this.currentSearchId);
            // Add to guesses.
            this.pastGuesses.push(this.currentSearchId);

            // Check if correct.
            const correct = this.currentSearchId == this.trackId;
            console.log("... was it was corrrect?", correct);
            this.$emit(correct ? "correctGuess" : "incorrectGuess");
        },
    },
});
</script>
