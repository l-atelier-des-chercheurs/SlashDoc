<template>
  <div class="_form-review">
    <div class="u-spacingBottom">
      <DLabel :str="$t('title')" />
      <h2>
        {{ title || $t("none") }}
      </h2>
    </div>
    <div class="u-spacingBottom">
      <DLabel :str="$t('description')" />
      <div v-html="description || $t('none_f')" />
    </div>
    <div class="u-spacingBottom">
      <DLabel :str="$t('keywords')" />
      <div v-if="keywords.length > 0">
        <KeywordsField :keywords="keywords" :can_edit="false" />
      </div>
      <div v-else>{{ $t("none") }}</div>
    </div>

    <div class="">
      <DLabel :str="$t('destination_corpus')" />
      <DestinationCorpusSelector
        :selected_destination_folder_path.sync="localDestinationFolderPath"
      />
    </div>
  </div>
</template>

<script>
import KeywordsField from "@/components/KeywordsField.vue";
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  name: "MediastackStepReview",
  components: {
    KeywordsField,
    DestinationCorpusSelector,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    keywords: {
      type: Array,
      default: () => [],
    },
    destinationFolderPath: {
      type: [String, undefined],
      default: undefined,
    },
  },
  data() {
    return {
      localDestinationFolderPath: this.destinationFolderPath,
    };
  },
  watch: {
    destinationFolderPath(newVal) {
      this.localDestinationFolderPath = newVal;
    },
    localDestinationFolderPath(newVal) {
      this.$emit("update:destinationFolderPath", newVal);
    },
  },
};
</script>

<style lang="scss" scoped></style>
