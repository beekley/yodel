<template>
    <div>
        {{ $props.track?.name }}
        <TrackPlayer :previewUrl="track?.previewUrl" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { TrackInfo } from "../../../api/src/types";
import TrackPlayer from "./TrackPlayer.vue";

export default defineComponent({
    components: {
        TrackPlayer,
    },
    props: {
        track: {
            // Looks weird, but what we have to do to use an interface as a type here.
            type: Object as () => TrackInfo,
        },
        key: {
            type: String,
        },
    },
    onUpdated() {
        console.log(this.$props.track);
    },
});
</script>
