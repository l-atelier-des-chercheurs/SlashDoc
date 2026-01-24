<template>
  <div class="u-spacingBottom _form-team">
    <div class="u-spacingBottom">
      <DLabel :str="$t('archiving_community')" />
      <DestinationCorpusSelector
        :selected_destination_folder_path.sync="local_destination_folder_path"
      />
    </div>

    <AuthorField
      :label="$t('authors')"
      :instructions="$t('media_editing_instructions')"
      :authors_paths="authors"
      :disable_links="true"
      :can_edit="true"
      @save="onAuthorsChange"
    />
  </div>
</template>

<script>
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  name: "MediastackStepAuthors",
  components: {
    DestinationCorpusSelector,
  },
  props: {
    authors: {
      type: Array,
      default: () => [],
    },
    destination_folder_path: {
      type: [String, undefined],
      default: undefined,
    },
  },
  data() {
    return {
      local_destination_folder_path: this.destination_folder_path,
    };
  },
  watch: {
    destination_folder_path: {
      immediate: true,
      handler(newVal) {
        this.local_destination_folder_path = newVal;
      },
    },
    local_destination_folder_path(newVal) {
      this.$emit("update:destination_folder_path", newVal);
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
