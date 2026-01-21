<template>
  <div class="u-spacingBottom _form-team">
    <AuthorField
      :label="$t('authors')"
      :instructions="$t('media_editing_instructions')"
      :authors_paths="authors"
      :can_edit="true"
      @save="onAuthorsChange"
    />
  </div>
</template>

<script>
export default {
  name: "MediastackStepAuthors",
  props: {
    authors: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    onAuthorsChange(authors) {
      this.$emit("update:authors", authors);
    },
  },
};
</script>

<style lang="scss" scoped></style>
