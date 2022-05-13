<template>
    <button @click=play>play</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        previewUrl: {
            type: String,
            required: true,
        }
    },
    methods: {
        play() {
            // TODO: preview multiple plays.
            console.log('playing:', this.$props.previewUrl);
            const preview = new Audio(this.$props.previewUrl);
            preview.play();
        },
    },
})
</script>
