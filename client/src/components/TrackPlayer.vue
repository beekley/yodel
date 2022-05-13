<template>
    <button @click=play>play</button>
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
            required: true,
        }
    },
    data() {
        const state: State = State.Playing;
        return {
            state,
            preview: new Audio(this.$props.previewUrl), 
        }
    },
    methods: {
        play() {
            console.log('playing:', this.$props.previewUrl);
            this.preview.pause();
            // Not sure why, but I had to add this to make it play.
            this.preview = new Audio(this.$props.previewUrl);
            this.preview.play();
        },
    },
})
</script>
