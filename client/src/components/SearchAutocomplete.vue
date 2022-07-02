<template>
    <div class="autocompleteContainer">
        <input
            v-model="searchid"
            @input="onChange"
            type="text"
            ref="input"
            @keydown.down="onArrowDown"
            @keydown.up="onArrowUp"
            @keydown.enter="onEnter"
        />
        <ul v-show="isOpen" class="autocomplete-results">
            <li
                v-for="(result, i) in results"
                v-bind="key"
                :key="i"
                @click="setResult(result)"
                class="autocomplete-result"
                :class="{ 'is-selected': i === selectedIndex }"
            >
                {{ result }}
            </li>
        </ul>
    </div>
</template>

<!-- TODO: make TS -->
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
    emits: ["searchId", "change", "enter"],
    data() {
        return {
            searchid: "",
            results: [],
            isOpen: false,
            selectedIndex: -1, // Index of selected track?
        };
    },
    mounted() {
        console.log("Mounted search.");
        document.addEventListener("click", this.handleClickOutside);
        const input = this.$refs.input;
        input.focus();
    },
    destroyed() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        async filterResults() {
            this.results = this.items.filter(
                (item) => simplify(item).indexOf(simplify(this.searchid)) > -1
            );
        },
        setResult(result) {
            console.log("setting result:", this.result);
            this.searchid = result;
            this.isOpen = false;
            // Selecting an answer doesn't trigger "onChange".
            this.$emit("searchId", this.searchid);
        },
        onChange() {
            this.filterResults();
            this.isOpen = true;
            // Emit a change so the parent knows.
            this.$emit("searchId", this.searchid);
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isOpen = false;
            }
        },
        onArrowDown() {
            if (this.selectedIndex < this.results.length) {
                this.selectedIndex = this.selectedIndex + 1;
            }
            console.log("down", this.selectedIndex, this.results[this.selectedIndex]);
        },
        onArrowUp() {
            if (this.selectedIndex > 0) {
                this.selectedIndex = this.selectedIndex - 1;
            }
            console.log("up", this.selectedIndex, this.results[this.selectedIndex]);
        },
        onEnter() {
            if (this.selectedIndex < 0) {
                console.log("No track selected from list, so bubbling enter event up");
                this.$emit("enter");
                return;
            }
            this.setResult(this.results[this.selectedIndex]);
            this.selectedIndex = -1;
            // this.isOpen = false;
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
    /* border: 1px solid #eeeeee; */
    height: 120px;
    /* min-height: 1em;
    max-height: 6em; */
    overflow: auto;
}

.autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
}

.autocomplete-result.is-selected,
.autocomplete-result:hover {
    background-color: #4aae9b;
    color: white;
}
</style>