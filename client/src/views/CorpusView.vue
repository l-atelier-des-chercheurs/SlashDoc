<template>
  <div class="_corpusView">
    <!-- Selection view: show when no communities are selected -->
    <div v-if="!hasSelectedCommunities" class="_selectionView">
      <div class="_header">
        <h1 class="_title">{{ $t("Communautés") }}</h1>
        <div class="_headerActions">
          <button
            type="button"
            class="u-button u-button_icon u-button_transparent _addCommunityButton"
            @click="show_add_community = true"
            :title="$t('add_community')"
          >
            <b-icon icon="plus" />
            {{ $t("add_community") }}
          </button>
        </div>
      </div>
      <div class="_communitiesList">
        <div
          v-for="folder in displayed_folders"
          :key="folder.$path"
          class="_communityItem"
        >
          <input
            type="checkbox"
            :id="folder.$path"
            :value="folder.$path"
            v-model="selected_folders"
            class="_checkbox"
          />
          <label :for="folder.$path" class="_label">
            <div class="_communityTitle">
              {{ folder.title || $t("untitled") }}
            </div>
            <div v-if="folder.description" class="_communityDescription">
              {{ folder.description }}
            </div>
          </label>
        </div>
        <div v-if="displayed_folders.length === 0" class="_noCommunities">
          {{ $t("no_communities_available") }}
        </div>
      </div>
      <div class="_actions">
        <button
          type="button"
          class="u-button u-button_primary"
          :disabled="selected_folders.length === 0"
          @click="openSelectedCommunities"
        >
          {{ $t("open") }}
        </button>
      </div>
    </div>

    <!-- Content view: show when communities are selected -->
    <SharedFolder2
      v-else
      :shared_folder_paths="shared_folder_paths"
      @toggleCorpus="toggleCorpus"
    />

    <!-- Add Community Modal -->
    <BaseModal2
      v-if="show_add_community"
      :title="$t('add_community')"
      @close="show_add_community = false"
    >
      <div class="_addCommunityList">
        <div
          v-for="folder in available_folders_to_add"
          :key="folder.$path"
          class="_addCommunityItem"
        >
          <button
            type="button"
            class="u-button u-button_white _addCommunityItemButton"
            @click="addCommunity(folder.$path)"
          >
            {{ folder.title || $t("untitled") }}
          </button>
        </div>
        <div
          v-if="available_folders_to_add.length === 0"
          class="_noMoreCommunities"
        >
          {{ $t("no_more_communities") }}
        </div>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import SharedFolder2 from "@/components/archive/SharedFolder2.vue";
export default {
  props: {},
  components: {
    SharedFolder2,
  },
  data() {
    return {
      all_folders: [],
      selected_folders: [],
      show_add_community: false,
    };
  },
  async created() {},
  async mounted() {
    // Load all available communities
    this.all_folders = await this.$api.getFolders({ path: "folders" });

    // If we have selected communities in URL, pre-select them
    if (this.shared_folder_paths.length > 0) {
      this.selected_folders = this.shared_folder_paths.slice();
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    hasSelectedCommunities() {
      return this.shared_folder_paths.length > 0;
    },
    shared_folder_paths() {
      if (this.$route.query.communities) {
        const slugs = this.$route.query.communities.split(",").filter(Boolean);
        return slugs.map((slug) => `folders/${slug.trim()}`);
      }
      return [];
    },
    available_folders_to_add() {
      // Return folders that are not already selected
      return this.all_folders.filter(
        (folder) => !this.selected_folders.includes(folder.$path)
      );
    },
    displayed_folders() {
      // Show all folders by default, or filter if needed
      return this.all_folders;
    },
  },
  methods: {
    openSelectedCommunities() {
      if (this.selected_folders.length === 0) return;

      const slugs = this.selected_folders.map((path) => path.split("/").pop());
      this.$router.push({
        path: "/explore",
        query: { communities: slugs.join(",") },
      });
    },
    toggleCorpus(path) {
      // Toggle a community in/out of the selection
      const slug = path.split("/").pop();
      const currentSlugs = this.shared_folder_paths.map((p) =>
        p.split("/").pop()
      );
      const isActive = currentSlugs.includes(slug);

      let newSlugs;
      if (isActive) {
        // Remove it
        newSlugs = currentSlugs.filter((s) => s !== slug);
      } else {
        // Add it
        newSlugs = [...currentSlugs, slug];
      }

      if (newSlugs.length === 0) {
        // If no communities selected, go to explore without params
        this.$router.push({ path: "/explore" });
      } else {
        this.$router.push({
          path: "/explore",
          query: { communities: newSlugs.join(",") },
        });
      }
    },
    addCommunity(folder_path) {
      // Add community to selected list if not already selected
      if (!this.selected_folders.includes(folder_path)) {
        this.selected_folders.push(folder_path);
      }
      this.show_add_community = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._corpusView {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

._selectionView {
  padding: calc(var(--spacing) * 2);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

._header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) * 2);
  gap: calc(var(--spacing));
}

._title {
  font-size: var(--sl-font-size-xx-large);
  font-weight: 400;
  margin: 0;
}

._headerActions {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
}

._addCommunityButton {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._communitiesList {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) * 2);
}

._communityItem {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
  border: 1px solid var(--h-300);
  border-radius: 4px;
  background: var(--body-bg);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--h-400);
    background: var(--h-100);
  }
}

._checkbox {
  flex: 0 0 auto;
  margin-top: calc(var(--spacing) / 4);
}

._label {
  flex: 1 1 auto;
  cursor: pointer;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}

._communityTitle {
  font-weight: 500;
  font-size: var(--sl-font-size-medium);
}

._communityDescription {
  font-size: var(--sl-font-size-small);
  color: var(--h-600);
}

._actions {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}

._noCommunities {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--h-600);
  font-style: italic;
}

._addCommunityList {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  max-height: 60vh;
  overflow-y: auto;
  padding: calc(var(--spacing) / 2);
}

._addCommunityItem {
  display: flex;
  flex-flow: row nowrap;
}

._addCommunityItemButton {
  width: 100%;
  justify-content: flex-start;
}

._noMoreCommunities {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--h-600);
  font-style: italic;
}
</style>
