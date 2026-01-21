<template>
  <div class="u-spacingBottom _form-credits">
    <DLabel :str="$t('general_credit')" icon_name="c-circle" />
    <input type="text" v-model="localGeneralCredit" />
    <div class="u-spacingBottom u-instructions">
      {{ $t("general_credit_instructions") }}
    </div>

    <div class="_thumbGrid" v-if="selected_items && selected_items.length">
      <ChutierItem
        v-for="file in selected_items"
        :key="file.$path"
        :file="file"
        :is_selected="false"
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
    localGeneralCredit: {
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
</style>
