<template>
  <div class="u-spacingBottom _form-credits">
    <DLabel :str="$t('general_credit')" class="_label" icon_name="c-circle" />
    <div class="u-instructions">
      <small>
        {{ $t("general_credit_instructions") }}
      </small>
    </div>
    <input type="text" v-model="local_general_credit" />
    <div class="u-spacingBottom" />

    <div class="_thumbGrid" v-if="selected_items && selected_items.length">
      <ChutierItem
        v-for="file in selected_items"
        :key="file.$path"
        :file="file"
        :credit_placeholder="local_general_credit"
        :is_selected="false"
        :context="'credits'"
        class="_thumbCell"
      />
    </div>
  </div>
</template>

<script>
import ChutierItem from "@/components/chutier/ChutierItem.vue";
export default {
  name: "MediastackStepCredits",
  props: {
    selected_items: {
      type: Array,
      default: () => [],
    },
    general_credit: {
      type: String,
      default: "",
    },
  },
  computed: {
    local_general_credit: {
      get() {
        return this.general_credit;
      },
      set(newVal) {
        this.$emit("update:general_credit", newVal);
      },
    },
  },
  components: {
    ChutierItem,
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
._thumbGrid {
  > * {
    &:not(:last-child) {
      border-bottom: 2px solid var(--g-100);
    }
  }
}
._labelLine {
  margin-bottom: 0;

  :deep(.u-label) {
    margin-bottom: 0;
  }
}
</style>
