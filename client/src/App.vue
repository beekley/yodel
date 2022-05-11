<template>
  <div id="app">
    <button @click="getTracks">get tracks</button>
    <SearchAutocomplete
      :items="tracks"
    />
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted } from 'vue'
import SearchAutocomplete from './components/SearchAutocomplete.vue'
import type { TrackInfo } from "./../../api/src/types"

export default defineComponent({
  name: 'App',
  components: {
    SearchAutocomplete
  },
  data() {
    return {
      tracks: [] as string[],
    }
  },
  methods: {
    async getTracks() {
      const data: TrackInfo[] = (await axios.get("/userId/129048914")).data;
      console.log(data);
      this.tracks = data.map((t) => t.name)
    },
  }
})
</script>