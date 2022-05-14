<template>
    <div class="trackContainer">
        {{ $props.track?.name }}
        <TrackPlayer :previewUrl="track?.previewUrl" />
        <SearchAutocomplete :items="tracks" @search-id="onSearchChange" />
        <button @click="onSubmit">submit</button>
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
        return {
            currentSearchId: "",
        };
    },
    methods: {
        onSearchChange(searchId: string) {
            this.currentSearchId = searchId;
        },
        onSubmit() {
            console.log("Submitting as guess:", this.currentSearchId);
            const correct = this.currentSearchId == this.trackId;
            console.log("... was it was corrrect?", correct);
        },
    },
});
</script>
