<template>
  <div class="u-spacingBottom _form-tags">
    <KeywordsFieldEditor
      :keywords="keywords"
      @update:keywords="onKeywordsChange"
    />
  </div>
</template>

<script>
import KeywordsFieldEditor from "@/components/KeywordsFieldEditor.vue";

export default {
  name: "MediastackStepKeywords",
  components: {
    KeywordsFieldEditor,
  },
  props: {
    keywords: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    onKeywordsChange(newVal) {
      this.$emit("update:keywords", newVal);
    },
  },
};
</script>

<style lang="scss" scoped></style>
