<template>
    <div class="results">
        <div>
            Results: {{ currentGameHistory.correctCount }}/{{
                currentGameHistory.trackCount
            }}
            tracks correct in {{ currentGameHistory.guessCount }} guess(es).
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

export interface GameHistory {
    timestamp: number;
    gameDurationSeconds: number;
    trackCount: number;
    guessCount: number;
    correctCount: number;
}

export default defineComponent({
    props: {
        gameHistories: {
            type: Array as PropType<GameHistory[]>,
            required: true,
        },
    },
    data() {
        const currentGameHistory: GameHistory = this.gameHistories.pop() ?? {
            timestamp: 0,
            gameDurationSeconds: 0,
            trackCount: 0,
            guessCount: 0,
            correctCount: 0,
        };
        return {
            currentGameHistory,
        };
    },
});
</script>
