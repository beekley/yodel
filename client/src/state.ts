// Global game state.
import { reactive } from "vue";

export enum State {
    Before, // before playing
    Playing, // while playing
    After, // after playing
}

export default reactive({
    state: State.Playing,
});
