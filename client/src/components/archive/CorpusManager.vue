<template>
  <div class="_corpusManager">
    <SharedFolder2
      :shared_folder_paths="computed_shared_folder_paths"
      :select_mode="select_mode"
      :read_only="read_only"
      @toggleCorpus="toggleCorpus"
      @openCorpusSelection="show_corpus_selection = true"
      @selectStack="$emit('selectStack', $event)"
      @selectMedias="$emit('selectMedias', $event)"
    />
    <transition name="fade">
      <CorpusSelectionModal
        v-if="show_corpus_selection"
        :all_folders="all_folders"
        :selected_folders.sync="selected_folders"
        @close="onCloseSelection"
        @select="handleModalSelect"
        @created="onCommunityCreated"
        @remove="onCommunityRemoved"
      />
    </transition>
  </div>
</template>
<script>
import SharedFolder2 from "@/components/archive/SharedFolder2.vue";
import CorpusSelectionModal from "@/components/archive/CorpusSelectionModal.vue";

export default {
  props: {
    shared_folder_paths: {
      type: Array,
      default: () => [],
    },
    select_mode: {
      type: [Boolean, String],
      default: false,
    },
    read_only: {
      type: Boolean,
      default: false,
    },
    use_query: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    SharedFolder2,
    CorpusSelectionModal,
  },
  data() {
    return {
      all_folders: [],
      selected_folders: [],
      show_corpus_selection: false,
    };
  },
  async created() {},
  async mounted() {
    // Load all available communities
    await this.loadAllFolders();
    this.$api.join({ room: "folders" });

    // Initialize selected folders
    if (this.use_query) {
      // If route has query params, use those (override localStorage)
      if (this.$route && this.$route.query && this.$route.query.communities) {
        const queryPaths = this.computed_shared_folder_paths;
        if (queryPaths.length > 0) {
          this.selected_folders = queryPaths.slice();
          // Save to localStorage
          this.saveToLocalStorage(this.selected_folders);
        }
      } else {
        // No query params, try to load from localStorage
        const saved = this.loadFromLocalStorage();
        if (saved && saved.length > 0) {
          // Verify that saved communities still exist
          const validPaths = saved.filter((path) =>
            this.all_folders.find((f) => f.$path === path)
          );
          if (validPaths.length > 0) {
            this.selected_folders = validPaths;
            // Update route to reflect localStorage
            const slugs = validPaths.map((path) => path.split("/").pop());
            this.$router.replace({
              path: this.$route.path,
              query: { communities: slugs.join(",") },
            });
          }
        }
      }
    } else {
      // If using local state, try to get from prop first, then localStorage
      if (this.shared_folder_paths && this.shared_folder_paths.length > 0) {
        this.selected_folders = this.shared_folder_paths.slice();
      } else {
        // Load from localStorage
        const saved = this.loadFromLocalStorage();
        if (saved && saved.length > 0) {
          // Verify that saved communities still exist
          const validPaths = saved.filter((path) =>
            this.all_folders.find((f) => f.$path === path)
          );
          if (validPaths.length > 0) {
            this.selected_folders = validPaths;
            // Update parent component (this will trigger the watcher to save to localStorage)
            this.$nextTick(() => {
              this.$emit("communitiesSelected", this.selected_folders);
            });
          }
        }
      }
    }

    // If no communities selected, show selection modal
    if (this.selected_folders.length === 0) {
      this.show_corpus_selection = true;
    }
  },
  beforeDestroy() {},
  watch: {
    computed_shared_folder_paths: {
      handler(newPaths) {
        if (this.use_query) {
          // When query params are present, use them (override localStorage)
          if (
            this.$route &&
            this.$route.query &&
            this.$route.query.communities
          ) {
            this.selected_folders = newPaths ? newPaths.slice() : [];
            // Save to localStorage (will be saved by selected_folders watcher too)
          }
          // If no query params, don't update from computed (let localStorage handle it in mounted)
        }
      },
      immediate: true,
    },
    shared_folder_paths: {
      handler(newPaths) {
        if (!this.use_query) {
          this.selected_folders = newPaths ? newPaths.slice() : [];
        }
      },
      immediate: true,
    },
    selected_folders: {
      handler(newFolders) {
        // Update query if needed
        if (this.use_query) {
          const slugs = newFolders.map((path) => path.split("/").pop());
          const newQuery = slugs.join(",");
          const currentQuery =
            this.$route.query && this.$route.query.communities
              ? this.$route.query.communities
              : "";

          if (newQuery !== currentQuery) {
            this.$router.push({
              path: this.$route.path,
              query: { communities: newQuery },
            });
          }
        }
        // Always save to localStorage
        this.saveToLocalStorage(newFolders);
      },
      deep: true,
    },
  },
  computed: {
    computed_shared_folder_paths() {
      if (this.use_query) {
        // Use route query
        if (this.$route && this.$route.query && this.$route.query.communities) {
          const slugs = this.$route.query.communities
            .split(",")
            .filter(Boolean);
          return slugs.map((slug) => `folders/${slug.trim()}`);
        }
        return [];
      } else {
        // Use local state (prop)
        return this.shared_folder_paths || [];
      }
    },
  },
  methods: {
    async loadAllFolders() {
      this.all_folders = await this.$api.getFolders({ path: "folders" });
      this.all_folders = this.all_folders.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    },
    onCloseSelection() {
      this.show_corpus_selection = false;
    },
    handleModalSelect({ folder_path, is_selected }) {
      this.handleSelect(folder_path, is_selected);
    },
    handleSelect(folder_path, is_selected) {
      if (is_selected) {
        if (!this.selected_folders.includes(folder_path)) {
          this.selected_folders.push(folder_path);
        }
      } else {
        this.selected_folders = this.selected_folders.filter(
          (f) => f !== folder_path
        );
      }
      this.updateSelection();
    },
    updateSelection() {
      if (this.use_query) {
        // Update route query
        const slugs = this.selected_folders.map((path) =>
          path.split("/").pop()
        );
        this.$router.push({
          path: this.$route.path,
          query: { communities: slugs.join(",") },
        });
      } else {
        // Emit event for local state management
        this.$emit("communitiesSelected", this.selected_folders);
      }
    },
    toggleCorpus(path) {
      if (this.use_query) {
        // Toggle via route query
        const slug = path.split("/").pop();
        const currentSlugs = this.computed_shared_folder_paths.map((p) =>
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
          // If no communities selected, update route and show modal
          this.$router.push({ path: this.$route.path });
          this.selected_folders = [];
          this.show_corpus_selection = true;
        } else {
          this.$router.push({
            path: this.$route.path,
            query: { communities: newSlugs.join(",") },
          });
        }
      } else {
        // Toggle via local state
        const isActive = this.selected_folders.includes(path);
        if (isActive) {
          this.selected_folders = this.selected_folders.filter(
            (f) => f !== path
          );
        } else {
          this.selected_folders.push(path);
        }
        // Update local shared_folder_paths and emit
        this.$emit("communitiesSelected", this.selected_folders);

        if (this.selected_folders.length === 0) {
          this.show_corpus_selection = true;
        }
      }
    },
    async onCommunityCreated(new_folder_slug) {
      await this.loadAllFolders();
      // Optionally auto-select:
      // const new_folder_path = `folders/${new_folder_slug}`;
      // this.handleSelect(new_folder_path, true);
    },
    async onCommunityRemoved(removed_path) {
      // Remove from local list
      this.all_folders = this.all_folders.filter(
        (f) => f.$path !== removed_path
      );
      this.selected_folders = this.selected_folders.filter(
        (f) => f !== removed_path
      );

      if (this.use_query) {
        // Update route query
        const currentSlugs = this.computed_shared_folder_paths.map((p) =>
          p.split("/").pop()
        );
        const removedSlug = removed_path.split("/").pop();
        const newSlugs = currentSlugs.filter((s) => s !== removedSlug);

        if (newSlugs.length === 0) {
          this.$router.push({ path: this.$route.path });
          // Modal should be open or stay open
        } else {
          this.$router.push({
            path: this.$route.path,
            query: { communities: newSlugs.join(",") },
          });
        }
      } else {
        // Emit event to parent for local state management
        this.$emit("communityRemoved", removed_path);
      }
    },
    saveToLocalStorage(folders) {
      try {
        if (folders && folders.length > 0) {
          localStorage.setItem(
            "corpusManager.selected_communities",
            JSON.stringify(folders)
          );
        } else {
          localStorage.removeItem("corpusManager.selected_communities");
        }
      } catch (error) {
        console.warn(
          "Failed to save selected communities to localStorage",
          error
        );
      }
    },
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(
          "corpusManager.selected_communities"
        );
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn(
          "Failed to load selected communities from localStorage",
          error
        );
      }
      return null;
    },
  },
};
</script>
<style lang="scss" scoped>
._corpusManager {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}
</style>
