<template>
  <div class="_openedList">
    <!-- <DLabel :str="list_meta.title" /> -->
      <transition-group name="list" class="_listItems">
        <div key="header">
          <DLabel :str="$t('new_note_todo')" />
        </div>
        <div class="_listItem _listItem_newItem" key="newItem">
          <TextInput
            :content.sync="new_item_title"
            :placeholder="$t('title')"
            :custom_formats="[]"
            @onEnter="createNewItem"
          >
            <template #suffix>
              <button
                type="button"
                class="u-button u-button_small u-button_icon"
                @click="createNewItem"
              >
                <b-icon icon="plus-circle-fill" />
              </button>
            </template>
          </TextInput>
        </div>
        <div key="list">
          <DLabel :str="$t('list_of_notes_todo')" />
        </div>
        <div
          class="_listItem _listItem_todo"
          v-for="item in list_items_todo"
          :key="item.$path"
        >
          {{ item.title }}
        </div>
      </transition-group>

      <pre>{{ list_meta }}</pre>
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
      new_item_title: "",
      list_meta: undefined,
    };
  },
  async created() {
    await this.fetchListMeta();
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    list_items_todo() {
      if (
        this.list_meta === undefined ||
        Array.isArray(this.list_meta.notes_list) === false
      )
        return [];

      const all_notes = this.list_meta?.$files || [];

      return this.list_meta.notes_list.reduce((acc, meta) => {
        const note = all_notes.find((note) =>
          note.$path.endsWith("/" + meta.meta_filename)
        );
        if (note) {
          acc.push(note);
        }
        return acc;
      }, []);
    },
  },
  methods: {
    async fetchListMeta() {
      const list_meta = await this.$api.getFolder({
        path: this.path,
      });
      this.list_meta = list_meta;
    },
    async createNewItem() {
      debugger;

      if (!this.new_item_title) return;
      const filename = `${this.new_item_title}.txt`;

      const { meta_filename } = await this.$api.uploadText({
        path: this.list_meta.$path,
        filename,
        content: "",
        additional_meta: {
          title: this.new_item_title,
          state: "todo",
        },
      });

      this.new_item_title = "";

      const current_list = JSON.parse(
        JSON.stringify(this.list_meta?.notes_list || [])
      );
      current_list.splice(0, 0, { meta_filename });

      this.$api.updateMeta({
        path: this.list_meta.$path,
        new_meta: {
          notes_list: current_list,
        },
      });

      // this.$api.updateMeta({
      //   path: this.list_meta.$path,
      //   new_meta: {
      //     notes_list: [...this.list_items, { meta_filename }],
      //   },
      // });
    },
  },
};
</script>
<style lang="scss" scoped>
._openedList {
  position: relative;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  max-width: 500px;
  padding: calc(var(--spacing) * 2);
  margin: 0 auto;
}

._listItems {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  background-color: rgba(0,0,0, 0.1);
  padding: calc(var(--spacing) / 2);
  border-radius: calc(var(--border-radius) * 2);
}

._listItem {
  position: relative;
  background-color: white;
  padding: calc(var(--spacing) / 2);
  border-radius: var(--border-radius);
}

._listItem_newItem {
  // display: flex;
  // flex-flow: row nowrap;
  padding: 0;
  padding-right: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 2);
}

._listItem_todo {
}
</style>
