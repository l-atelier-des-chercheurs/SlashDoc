<template>
  <div v-if="has_active_filters" class="_activeFiltersBar">
    <div class="_filtersLine">
      <SingleKeyword
        v-for="keyword in keywords_filter"
        :key="keyword"
        :keyword="keyword"
        :show_category="true"
        :can_remove="true"
        @remove="removeKeyword(keyword)"
      />
      <button
        v-if="author_path_filter"
        type="button"
        class="_filterChip _filterChip_author"
        @click="clearAuthorFilter"
      >
        <span class="_chipLabel">{{ author_display_label }}</span>
        <b-icon class="_chipRemove" icon="x" />
      </button>
      <button
        type="button"
        class="u-buttonLink _resetBtn"
        @click="resetFilters"
      >
        {{ $t("reset_filters") }}
      </button>
    </div>
  </div>
</template>
<script>
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  components: { SingleKeyword },
  props: {
    author_path_filter: {
      type: String,
      default: "",
    },
    keywords_filter: {
      type: Array,
      default: () => [],
    },
    author_label: {
      type: String,
      default: "",
    },
  },
  computed: {
    has_active_filters() {
      return (
        (this.keywords_filter && this.keywords_filter.length > 0) ||
        !!this.author_path_filter
      );
    },
    author_display_label() {
      if (this.author_label) return this.author_label;
      if (!this.author_path_filter) return "";
      // Use getAuthor from mixin to retrieve the author object and display its name.
      const author = this.getAuthor(this.author_path_filter);
      if (author && author.name) return author.name;
      return "";
    },
  },
  methods: {
    removeKeyword(keyword) {
      const next = (this.keywords_filter || []).filter((kw) => kw !== keyword);
      this.$emit("update:keywords_filter", next);
    },
    clearAuthorFilter() {
      this.$emit("update:author_path_filter", "");
    },
    resetFilters() {
      this.$emit("update:keywords_filter", []);
      this.$emit("update:author_path_filter", "");
    },
  },
};
</script>
<style lang="scss" scoped>
._activeFiltersBar {
  padding: calc(var(--spacing) / 2);
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 2);
  min-height: 28px;
}

._filtersLine {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 0.5);
}

._filterChip {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 0.25);
  border: 1px solid var(--c-gris_fonce);
  border-radius: 4px;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  color: var(--c-noir);
  background-color: transparent;

  ._chipLabel {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ._chipRemove {
    flex-shrink: 0;
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

._filterChip_author {
  border-color: var(--c-gris-fonce, #888);
  background: rgba(0, 0, 0, 0.04);
}

._resetBtn {
  margin-left: calc(var(--spacing) * 0.5);
}
</style>
