<template>
    <div>
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
        },
        stop() {
            console.log("stopping:", this.$props.previewUrl);
            this.state = State.Stopped;
            this.preview.pause();
        },
    },
});
</script>
