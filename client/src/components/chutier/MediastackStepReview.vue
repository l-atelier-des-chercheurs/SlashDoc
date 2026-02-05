<template>
  <div class="_form-review">
    <div class="u-spacingBottom">
      <!-- <DLabel :str="$t('title')" /> -->
      <h1>
        {{ title || $t("none") }}
      </h1>
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

    <div class="u-spacingBottom">
      <DLabel :str="$t('location')" />
      <div v-if="location && location.latitude && location.longitude">
        <PositionPicker :content="location" :can_edit="false" />
      </div>
      <div v-else>{{ $t("none") }}</div>
    </div>

    <div class="u-spacingBottom">
      <DLabel :str="$t('destination_corpus')" />
      <b v-if="selected_folder">
        {{ selected_folder.title }}
      </b>
      <div v-else>{{ $t("none") }}</div>
    </div>

    <div class="">
      <DLabel :str="$t('authors')" />
      <div v-if="authors.length > 0">
        <AuthorField
          :authors_paths="authors"
          :disable_links="true"
          :can_edit="false"
        />
      </div>
      <div v-else>{{ $t("none") }}</div>
    </div>
  </div>
</template>

<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  name: "MediastackStepReview",
  components: {
    KeywordsField,
    PositionPicker: () => import("@/adc-core/inputs/PositionPicker.vue"),
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
    selected_destination_folder_path: {
      type: String,
      default: "",
    },
    authors: {
      type: Array,
      default: () => [],
    },
    location: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      selected_folder: null,
    };
  },
  async created() {
    if (this.selected_destination_folder_path) {
      this.selected_folder = await this.$api.getFolder({
        path: this.selected_destination_folder_path,
      });
    }
  },
};
</script>

<style lang="scss" scoped></style>
