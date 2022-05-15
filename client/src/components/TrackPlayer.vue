<template>
    <div class="trackPlayerContainer">
        <button v-if="state == 1" @click="play">play</button>
        <button v-else @click="stop">stop</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

enum State {
    Playing,
    Stopped,
}

const maxPreviewLength = 30; // seconds.

export default defineComponent({
    props: {
        previewUrl: {
            type: String,
            // required: true,
        },
    },
    data() {
        return {
            state: State.Stopped,
            preview: new Audio(this.$props.previewUrl),
        };
    },
    methods: {
        play() {
            console.log("playing:", this.$props.previewUrl);
            this.state = State.Playing;
            // Not sure why, but I had to add this to make it play.
            this.preview = new Audio(this.$props.previewUrl);
            this.preview.play();
            // Pause once the preview has ended.
            const duration = Math.min(
                maxPreviewLength,
                isNaN(this.preview.duration) ? maxPreviewLength : this.preview.duration
            );
            setTimeout(() => {
                console.log("Stopping preview after duration (s):", duration);
                this.stop();
            }, duration * 1000);
        },
        stop() {
            console.log("stopping:", this.$props.previewUrl);
            this.state = State.Stopped;
            this.preview.pause();
        },
    },
});
</script>
