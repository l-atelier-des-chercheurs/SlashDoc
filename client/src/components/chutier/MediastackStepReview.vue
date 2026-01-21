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
  </div>
</template>

<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  name: "MediastackStepReview",
  components: {
    KeywordsField,
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
  },
};
</script>

<style lang="scss" scoped></style>
