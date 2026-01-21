<template>
  <div class="_communautesSection">
    <div class="_communautesLabel">
      <DLabel :str="$t('all_communities')" />
      <button
        type="button"
        class="u-button u-button_icon u-button_transparent _addCommunityButton"
        @click="$emit('openCorpusSelection')"
        :title="$t('see_all_communities')"
      >
        <b-icon icon="list" />
      </button>
    </div>
    <div class="_corpusItems">
      <button
        v-for="folder in all_folders"
        :key="folder.$path"
        type="button"
        class="u-button u-button_small u-button_pill u-button_transparent _corpusItem"
        :class="{ 'is--active': isCommunityActive(folder.$path) }"
        @click="$emit('toggleCorpus', folder.$path)"
      >
        {{ folder.title || $t("untitled") }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    all_folders: {
      type: Array,
      default: () => [],
    },
    active_folder_paths: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    isCommunityActive() {
      return (folder_path) => {
        return this.active_folder_paths.includes(folder_path);
      };
    },
  },
};
</script>

<style lang="scss" scoped>
._communautesSection {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) * 1);
  flex: 0 0 auto;
  min-width: 0;
  background-color: var(--g-50);
  padding: 0 calc(var(--spacing) * 2);
}

._communautesLabel {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
}

._corpusItems {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1 1 auto;
  min-width: 0;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));
}

._corpusItem {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 2);
}

._addCommunityButton {
  flex: 0 0 auto;
  margin-left: calc(var(--spacing) / 2);
}
</style>
