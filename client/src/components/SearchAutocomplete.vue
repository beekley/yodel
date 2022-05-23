<template>
    <div class="autocompleteContainer">
        <input v-model="search" @input="onChange" type="text" />
        <ul v-show="isOpen" class="autocomplete-results">
            <li
                v-for="(result, i) in results"
                v-bind="key"
                :key="i"
                @click="setResult(result)"
                class="autocomplete-result"
            >
                {{ result }}
            </li>
        </ul>
    </div>
</template>

<script>
const simplify = (s) => {
    const simpler = s
        .toLowerCase()
        // Remove punctuation.
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        // Remove whitespace.
        .replace(/\s/g, "");
    return simpler;
};

export default {
    name: "SearchAutocomplete",
    props: {
        items: {
            type: Array,
            required: false,
            default: () => [],
        },
    },
    // emits: {
    //     searchId: {
    //         type: string,
    //     },
    // },
    emits: ["searchId", "change"],
    data() {
        return {
            search: "",
            results: [],
            isOpen: false,
        };
    },
    mounted() {
        document.addEventListener("click", this.handleClickOutside);
    },
    destroyed() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        async filterResults() {
            this.results = this.items.filter(
                (item) => simplify(item).indexOf(simplify(this.search)) > -1
            );
        },
        setResult(result) {
            this.search = result;
            this.isOpen = false;
            // Selecting an answer doesn't trigger "onChange".
            this.$emit("searchId", this.search);
        },
        onChange() {
            this.filterResults();
            this.isOpen = true;
            // Emit a change so the parent knows.
            this.$emit("searchId", this.search);
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isOpen = false;
            }
        },
    },
};
</script>

<style>
.autocompleteContainer {
    position: relative;
}

.autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    height: 120px;
    min-height: 1em;
    max-height: 6em;
    overflow: auto;
}

.autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
}

.autocomplete-result:hover {
    background-color: #4aae9b;
    color: white;
}
</style>