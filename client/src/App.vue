<template>
    <div id="app">
        <button @click="getTracks">get tracks</button>
        <SearchAutocomplete :items="Array.from(tracks.keys())" @search-id="onSearchChange" />
    </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent, onMounted } from "vue";
import SearchAutocomplete from "./components/SearchAutocomplete.vue";
import type { TrackInfo } from "./../../api/src/types";
export default defineComponent({
  name: "App",
  components: {
    SearchAutocomplete,
  },
  data() {
    return {
      tracks: new Map<string, TrackInfo>(),
    };
  },
  methods: {
    async getTracks() {
      const data: TrackInfo[] = (await axios.get("/userId/129048914")).data;
      data.forEach((t) => {
        const compositeId = `${t.artists.map((a) => a.name).join(", ")} - ${
          t.name
        }`;
        this.tracks.set(compositeId, t);
      });
      console.log(this.tracks.keys());
    },
    onSearchChange(searchId: string) {
      console.log('onSearchChange', searchId);
    },
  },
});
</script>