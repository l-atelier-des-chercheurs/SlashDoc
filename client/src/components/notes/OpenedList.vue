<template>
  <div class="_openedNote">
    {{ path }}
    <DLabel :str="list_meta.title" />
    <div class="_listItems">
      <div class="_listItem" v-for="item in list_items" :key="item.$path">
        {{ item.title }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    path: {
      type: String,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      list_meta: undefined,
      list_items: [],
    };
  },
  created() {
    this.fetchListMeta();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async fetchListMeta() {
      const list_meta = await this.$api.getFolder({
        path: this.path,
      });
      this.list_meta = list_meta;
      this.list_items = this.list_meta.$files;
    },
  },
};
</script>
<style lang="scss" scoped>
._openedNote {
  position: relative;
  height: 100%;
  overflow: auto;
  color: white;
  display: flex;
  flex-flow: column nowrap;
}
</style>
