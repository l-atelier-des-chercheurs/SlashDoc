<template>
  <div>
    <div class="u-spacingBottom"></div>

    <div class="_form-title">
      <div class="u-spacingBottom">
        <DLabel :str="$t('title')" />
        <TextInput
          :content="title"
          :required="true"
          :placeholder="$t('document_title')"
          :autofocus="true"
          :can_edit="true"
          @update:content="onTitleChange"
          @toggleValidity="onTitleValidityChange"
        />
      </div>
      <div class="u-spacingBottom _description">
        <DLabel :str="$t('description')" />
        <TextInput
          :content="description"
          :input_type="'editor'"
          :placeholder="$t('description_placeholder')"
          :can_edit="true"
          @update:content="onDescriptionChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MediastackStepTitle",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  methods: {
    onTitleChange(newVal) {
      this.$emit("update:title", newVal);
    },
    onDescriptionChange(newVal) {
      this.$emit("update:description", newVal);
    },
    onTitleValidityChange(isValid) {
      this.$emit("title-validity-changed", isValid);
    },
  },
};
</script>

<style lang="scss" scoped>
._description {
  // border-radius: var(--input-border-radius);
  // background-color: var(--c-gris_clair);
  // overflow: hidden;
}
</style>
