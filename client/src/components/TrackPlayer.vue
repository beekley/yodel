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

const maxPreviewLength = 30 + 2; // seconds.

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
    watch: {
        stop() {
            console.log("Being told to stop from parent.");
            // Calling this.stop doesn't seem to work here...
            this.preview.pause();
        },
    },
    methods: {
        play() {
            console.log("playing:", this.$props.previewUrl);
            this.state = State.Playing;
            // Not sure why, but I had to add this to make it play.
            this.preview = new Audio(this.$props.previewUrl);
            this.preview.volume = 0.8;
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
            console.log("stopping:", this.previewUrl);
            this.state = State.Stopped;
            this.preview.pause();
        },
    },
    mounted() {
        console.log("Mounted track player.");
        // Start playing automatically.
        this.play();
    },
    // Stop the preview before removing the UI to stop it.
    beforeUnmount() {
        console.log("Unmounting component.");
        this.stop();
    },
});
</script>
