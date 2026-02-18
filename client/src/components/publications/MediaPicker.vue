<template>
  <div class="_mediaPicker">
    <PickExistingMediastackModal
      :modal_title="$t('pick_medias')"
      :select_mode="select_mode"
      :pick_from_types="pick_from_types"
      @close="$emit('close')"
      @mediasSelected="mediasSelected"
    />
  </div>
</template>
<script>
import PickExistingMediastackModal from "@/components/PickExistingMediastackModal.vue";

export default {
  props: {
    publication_path: String,
    select_mode: {
      type: String,
      default: "multiple",
    },
    pick_from_types: [String, Array],
    // Caller can pass when it has the value (e.g. under EditionTemplate) so child modal gets it despite portal.
    passed_meta_filenames_already_present: {
      type: Array,
      default: undefined,
    },
  },
  components: {
    PickExistingMediastackModal,
  },
  inject: {
    $getMetaFilenamesAlreadyPresent: {
      default: false,
    },
  },
  data() {
    return {
      selected_source: null,
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  computed: {
    meta_filenames_already_present_from_parent() {
      if (this.passed_meta_filenames_already_present !== undefined)
        return this.passed_meta_filenames_already_present;
      return this.$getMetaFilenamesAlreadyPresent
        ? this.$getMetaFilenamesAlreadyPresent()
        : [];
    },
    current_project_path() {
      const all_publications_path = this.getParent(this.publication_path);
      return this.getParent(all_publications_path);
    },
  },
  methods: {
    mediasSelected(medias) {
      this.$emit("pickMedias", medias);
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._sourceSelector {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  text-align: center;
  gap: calc(var(--spacing) / 2);
  // padding: 1rem 0;

  > * {
    flex: 1 1 0;
  }
}

._sourceBtn {
  // display: flex;
  // align-items: center;
  // gap: 1rem;
  // padding: 1.5rem;
  // text-align: left;
  // min-height: 80px;

  ._sourceBtnContent {
    // display: flex;
    // flex-direction: column;
    // gap: 0.25rem;

    // strong {
    //   font-size: 1.1rem;
    // }

    // small {
    //   opacity: 0.8;
    //   font-size: 0.9rem;
    // }
  }
}
</style>
