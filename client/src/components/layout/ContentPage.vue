<template>
  <div class="_contentPage">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "ContentPage",
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._contentPage {
  padding: var(--spacing) 0;
  width: 90%;
  max-width: 560px;
  padding: calc(var(--spacing) * 2);
  margin: 0 auto;

  ::v-deep {
    p {
      margin: calc(var(--spacing) * 1) 0;
    }
    ._section {
      margin-top: calc(var(--spacing) * 2);
    }
  }
}
</style>
