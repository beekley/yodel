<template>
    <div id="app">
        <button @click="getTracks">get tracks</button>
        <Track
            v-for="id in answerTrackIds"
            :key="id"
            :trackId="id"
            :track="tracks.get(id)"
            :tracks="Array.from(tracks.keys())"
        />
    </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent, onMounted } from "vue";
import Track from "./components/Track.vue";
import type { TrackInfo } from "../../api/src/types";

const answerCount = 20;

export default defineComponent({
    name: "App",
    components: {
        Track,
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
        };
    },
    methods: {
        async getTracks() {
            // Fetch from backend.
            const data: TrackInfo[] = (await axios.get("/userId/129048914")).data;

            // Break if not enough tracks.
            if (data.length < answerCount) {
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
            for (let i = 0; i < answerCount; i += 1) {
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
    },
});
</script>