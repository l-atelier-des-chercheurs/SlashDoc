<template>
  <div class="_sharedFolder">
    <div class="_topBar">
      <div class="_communautesSection">
        <DLabel :str="$t('all_communities')" class="_communautesLabel" />
        <div class="_corpusItems">
          <div
            v-for="folder in all_folders"
            :key="folder.$path"
            class="_corpusItem"
            :class="{ 'is--active': isCommunityActive(folder.$path) }"
          >
            <label
              :for="`corpus-checkbox-${folder.$path}`"
              class="u-button u-button_pill u-button_white _corpusItemLabel"
              :class="{ 'is--active': isCommunityActive(folder.$path) }"
            >
              <input
                type="checkbox"
                :id="`corpus-checkbox-${folder.$path}`"
                :checked="isCommunityActive(folder.$path)"
                @change="toggleCorpus(folder.$path)"
                class="_corpusCheckbox"
              />
              {{ folder.title || $t("untitled") }}
            </label>
          </div>
        </div>
        <button
          type="button"
          class="u-button u-button_icon u-button_transparent _addCommunityButton"
          @click="$router.push('/explore')"
          :title="$t('see_all_communities')"
        >
          <b-icon icon="list" />
        </button>
      </div>

      <div class="_topBarControls">
        <div class="_searchBar">
          <SearchInput2
            :value="search_str"
            @input="search_str = $event"
            :search_placeholder="$t('search_fields')"
          />
        </div>

        <button
          type="button"
          class="u-button u-button_icon u-button_transparent _filterToggle"
          :class="{ 'is--active': show_filter_bar }"
          @click="show_filter_bar = !show_filter_bar"
          :title="$t('toggle_filters')"
        >
          <b-icon icon="funnel" />
        </button>

        <div class="_displayOptions">
          <div class="_zoomSlider">
            <button
              type="button"
              class="u-button u-button_icon u-button_transparent"
              @click="
                stack_preview_width = Math.max(50, stack_preview_width - 10)
              "
            >
              <b-icon icon="dash" />
            </button>
            <input
              type="range"
              class="_inputRange"
              :value="stack_preview_width"
              min="50"
              max="250"
              step="5"
              @input="stack_preview_width = +$event.target.value"
            />
            <button
              type="button"
              class="u-button u-button_icon u-button_transparent"
              @click="
                stack_preview_width = Math.min(250, stack_preview_width + 10)
              "
            >
              <b-icon icon="plus" />
            </button>
          </div>

          <div class="_viewModeButtons">
            <button
              class="u-button u-button_icon"
              type="button"
              :class="{ 'is--active': view_mode === 'list' }"
              @click="view_mode = 'list'"
              :title="$t('list_view')"
            >
              <b-icon icon="grid3x3" />
            </button>
            <button
              class="u-button u-button_icon"
              type="button"
              :class="{ 'is--active': view_mode === 'fav' }"
              @click="view_mode = 'fav'"
              :title="$t('favorites_view')"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.38174 1.75501C7.59507 1.19234 8.40241 1.19234 8.61641 1.75501L9.99641 5.57767C10.0931 5.83101 10.3391 5.99967 10.6137 5.99967H14.0051C14.6317 5.99967 14.9051 6.77967 14.4124 7.16167L11.9991 9.33301C11.891 9.41611 11.812 9.53132 11.7734 9.66211C11.7348 9.7929 11.7387 9.93255 11.7844 10.061L12.6657 13.7963C12.8804 14.3963 12.1857 14.9117 11.6604 14.5423L8.38241 12.4623C8.27015 12.3834 8.13628 12.3411 7.99907 12.3411C7.86187 12.3411 7.728 12.3834 7.61574 12.4623L4.33774 14.5423C3.81307 14.9117 3.11774 14.3957 3.33241 13.7963L4.21374 10.061C4.25946 9.93255 4.26331 9.7929 4.22475 9.66211C4.18618 9.53132 4.10718 9.41611 3.99907 9.33301L1.58574 7.16167C1.09241 6.77967 1.36707 5.99967 1.99241 5.99967H5.38374C5.51727 6.00012 5.64778 5.96001 5.75802 5.88466C5.86825 5.8093 5.95301 5.70225 6.00107 5.57767L7.38107 1.75501H7.38174Z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="u-button u-button_icon"
              type="button"
              :class="{ 'is--active': view_mode === 'map' }"
              @click="view_mode = 'map'"
              :title="$t('map_view')"
            >
              <b-icon icon="map-fill" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="scaleInFade" mode="out-in">
      <StackDisplay
        v-if="opened_stack"
        class="_stackModal"
        :key="opened_stack.$path"
        :stack_path="opened_stack.$path"
        :context="'archive'"
        :can_be_added_to_fav="can_be_added_to_fav"
        :can_be_selected="select_mode"
        :is_favorite="isFavorite(opened_stack.$path)"
        :read_only="read_only"
        @toggleFav="toggleFav(opened_stack.$path)"
        @prevMedia="navMedia(-1)"
        @nextMedia="navMedia(+1)"
        @selectStack="$emit('selectStack', opened_stack)"
        @selectMedias="$emit('selectMedias', $event)"
        @close="closeStack"
      />
    </transition>

    <transition name="fade_fast" mode="out-in">
      <div class="_loader" v-if="is_loading_folder">
        <LoaderSpinner />
      </div>
      <TwoColumnLayout
        v-else
        :show-sidebar.sync="show_filter_bar"
        class="_sharedFolder--content"
      >
        <template #sidebar>
          <FilterBar
            :group_mode.sync="group_mode"
            :sort_order.sync="sort_order"
            :author_path_filter.sync="author_path_filter"
            :available_keywords="valid_keywords"
            :keywords_filter.sync="keywords_filter"
          >
          </FilterBar>
        </template>

        <template #content>
          <transition name="fade" mode="out-in">
            <div class="_stacksList" :key="sort_order + '-' + group_mode">
              <div
                v-if="grouped_stacks.length === 0"
                class="u-instructions _noContent"
              >
                {{ $t("no_content") }}
              </div>
              <template v-else>
                <template v-if="['list', 'fav'].includes(view_mode)">
                  <div
                    class="_dayFileSection"
                    v-for="{ label, files: stacks } in grouped_stacks"
                    :key="label"
                  >
                    <div class="_label">
                      {{ label }}
                    </div>
                    <div
                      class="_itemGrid"
                      :class="{
                        'is--compact': display_mode === 'compact',
                      }"
                      :style="{
                        '--stack_preview_width': `${stack_preview_width}px`,
                      }"
                    >
                      <StackPreview
                        v-for="stack in stacks"
                        :key="stack.$path"
                        :stack="stack"
                        :display="display_mode"
                        :is_selected="stack.$path === last_selected_stack_path"
                        :can_be_added_to_fav="can_be_added_to_fav"
                        :is_favorite="isFavorite(stack.$path)"
                        @toggleFav="toggleFav(stack.$path)"
                        @openStack="openStack"
                      />
                    </div>
                  </div>
                </template>
                <div
                  v-else-if="view_mode === 'map'"
                  key="mediaMap"
                  class="_mediamapContainer"
                >
                  <MediaMap
                    :medias="filtered_stacks"
                    @toggleMediaFocus="toggleMediaFocus"
                  />
                </div>
              </template>
            </div>
          </transition>
        </template>
      </TwoColumnLayout>
    </transition>
  </div>
</template>
<script>
import FilterBar from "@/components/archive/FilterBar.vue";
import StackPreview from "@/components/archive/StackPreview.vue";
import StackDisplay from "@/components/StackDisplay.vue";
import CorpusMenu from "@/components/archive/CorpusMenu.vue";
import TwoColumnLayout from "@/adc-core/ui/TwoColumnLayout.vue";
import SearchInput2 from "@/components/SearchInput2.vue";

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
    read_only: Boolean,
  },
  components: {
    FilterBar,
    StackPreview,
    StackDisplay,
    CorpusMenu,
    TwoColumnLayout,
    SearchInput2,
    MediaMap: () => import("@/adc-core/ui/MediaMap.vue"),
  },
  data() {
    return {
      folder: undefined,
      all_folders: [],
      all_stacks: [],

      show_corpus_menu: false,

      is_loading_folder: true,
      show_admin_settings: false,

      last_selected_stack_path: undefined,
      view_mode: localStorage.getItem("archive.view_mode") || "list",

      sort_order: localStorage.getItem("archive.sort_order") || "date_modified",

      search_str: localStorage.getItem("archive.search_str") || "",
      author_path_filter:
        localStorage.getItem("archive.author_path_filter") || "",
      keywords_filter: JSON.parse(
        localStorage.getItem("archive.keywords_filter") || "[]"
      ),
      group_mode: localStorage.getItem("archive.group_mode") || "year",

      selected_medias_paths: [],

      stack_preview_width:
        parseInt(localStorage.getItem("archive.stack_preview_width")) || 120,

      show_filter_bar:
        localStorage.getItem("archive.show_filter_bar") === "true",

      joined_rooms: new Set(), // Track which rooms we've joined
    };
  },
  i18n: {
    messages: {
      fr: {
        corpus_title: "Titre du corpus",
        search_fields:
          "Rechercher dans les champs titre et description des documents.",
        toggle_filters: "Afficher/masquer les filtres",
        list_view: "Vue liste",
        favorites_view: "Vue favoris",
        map_view: "Vue carte",
      },
      en: {
        corpus_title: "Corpus title",
        search_fields: "Search in titles or descriptions of documents.",
        toggle_filters: "Toggle filters",
        list_view: "List view",
        favorites_view: "Favorites view",
        map_view: "Map view",
      },
    },
  },
  async created() {},
  async mounted() {
    await this.checkExistingFolder();

    const primaryPath = this.active_folder_paths[0];
    if (primaryPath) {
      localStorage.setItem("last_opened_folder_path", primaryPath);
      this.folder = await this.$api.getFolder({
        path: primaryPath,
      });
    }

    // Load all folders for the add community modal
    this.all_folders = await this.$api.getFolders({ path: "folders" });

    // Load stacks from all active communities
    await this.loadStacksFromCommunities();

    // Join socket rooms for all communities (stay connected)
    this.active_folder_paths.forEach((path) => {
      this.joinRoom(path);
      this.joinRoom(path + "/stacks");
    });

    this.is_loading_folder = false;
  },
  beforeDestroy() {
    // Leave all socket rooms
    this.active_folder_paths.forEach((path) => {
      this.$api.leave({ room: path });
      this.$api.leave({ room: path + "/stacks" });
    });
  },
  watch: {
    opened_stack() {
      if (this.opened_stack) {
        this.last_selected_stack_path = this.opened_stack.$path;
      }
    },
    active_folder_paths: {
      async handler(newPaths, oldPaths) {
        if (JSON.stringify(newPaths) !== JSON.stringify(oldPaths)) {
          // Paths changed, reload stacks
          if (newPaths.length > 0) {
            // Join new rooms (stay connected, don't leave old ones)
            newPaths.forEach((path) => {
              this.joinRoom(path);
              this.joinRoom(path + "/stacks");
            });
            // Load new stacks
            await this.loadStacksFromCommunities();
            // Update primary folder
            if (newPaths[0]) {
              this.folder = await this.$api.getFolder({
                path: newPaths[0],
              });
            }
          }
        }
      },
      immediate: false,
    },
    sort_order() {
      localStorage.setItem("archive.sort_order", this.sort_order);
    },
    view_mode() {
      localStorage.setItem("archive.view_mode", this.view_mode);
    },
    search_str() {
      localStorage.setItem("archive.search_str", this.search_str);
    },
    author_path_filter() {
      localStorage.setItem(
        "archive.author_path_filter",
        this.author_path_filter
      );
    },
    keywords_filter: {
      handler(newVal) {
        localStorage.setItem("archive.keywords_filter", JSON.stringify(newVal));
      },
      deep: true,
    },
    group_mode() {
      localStorage.setItem("archive.group_mode", this.group_mode);
    },
    show_filter_bar() {
      localStorage.setItem("archive.show_filter_bar", this.show_filter_bar);
    },
    stack_preview_width() {
      localStorage.setItem(
        "archive.stack_preview_width",
        this.stack_preview_width.toString()
      );
    },
  },
  computed: {
    active_folder_paths() {
      return this.shared_folder_paths || [];
    },
    display_mode() {
      return this.stack_preview_width < 120 ? "compact" : "";
    },
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.folder });
    },
    stack_shared_folder_paths() {
      return this.active_folder_paths.map((path) => path + "/stacks");
    },
    can_be_added_to_fav() {
      return (
        this.connected_as &&
        this.connected_as?.$path !== undefined &&
        !this.read_only
      );
    },
    sorted_stacks() {
      return this.all_stacks
        .slice()
        .sort(
          (a, b) => +new Date(b.$date_modified) - +new Date(a.$date_modified)
        );
    },
    stacks_without_keyword_filter() {
      // Stacks filtered by all filters except keyword filter
      // Used to compute which keywords would result in 0 results
      return this.sorted_stacks.filter((f) => {
        if (this.view_mode === "fav")
          if (!this.isFavorite(f.$path)) return false;

        if (this.author_path_filter)
          if (!f.$authors?.includes(this.author_path_filter)) return false;

        if (this.search_str) {
          if (
            (f.title &&
              f.title.toLowerCase().includes(this.search_str.toLowerCase())) ||
            (f.description &&
              f.description
                .toLowerCase()
                .includes(this.search_str.toLowerCase()))
          )
            return true;
          else return false;
        }

        return true;
      });
    },
    filtered_stacks() {
      return this.sorted_stacks.filter((f) => {
        if (this.view_mode === "fav")
          if (!this.isFavorite(f.$path)) return false;

        if (this.author_path_filter)
          if (!f.$authors?.includes(this.author_path_filter)) return false;

        if (this.keywords_filter.length > 0) {
          // Inclusion logic: show only stacks that have ALL selected keywords (AND logic)
          if (!f.keywords || !Array.isArray(f.keywords)) return false;
          if (!this.keywords_filter.every((kwf) => f.keywords.includes(kwf)))
            return false;
        }

        if (this.search_str) {
          if (
            (f.title &&
              f.title.toLowerCase().includes(this.search_str.toLowerCase())) ||
            (f.description &&
              f.description
                .toLowerCase()
                .includes(this.search_str.toLowerCase()))
          )
            return true;
          else return false;
        }

        return true;
      });
    },
    grouped_stacks() {
      let order_props = ["$date_modified"];
      if (this.sort_order === "date_created")
        order_props = [
          "date_created_corrected",
          "$date_created",
          "$date_uploaded",
        ];
      else if (this.sort_order === "date_modified")
        order_props = ["$date_modified"];
      return this.groupFilesBy(
        this.filtered_stacks,
        order_props,
        this.group_mode
      );
    },
    timeline_stacks() {
      let order_props = [
        "date_created_corrected",
        "$date_created",
        "$date_uploaded",
      ];
      return this.groupFilesBy(this.filtered_stacks, order_props, "day");
    },
    available_keywords() {
      // Use sorted_stacks instead of filtered_stacks so all keywords remain visible
      // even when some are excluded from the view
      const all_kw = this.sorted_stacks.reduce((acc, f) => {
        if (f.keywords && Array.isArray(f.keywords)) {
          f.keywords.map((kw) => {
            const item = acc.find((_kw) => _kw.title === kw);
            if (item) item.count += 1;
            else acc.push({ title: kw, count: 1 });
          });
        }
        return acc;
      }, []);
      return all_kw.sort((a, b) => {
        return b.count - a.count;
      });
    },
    valid_keywords() {
      // Filter out keywords that would result in 0 results when combined with current selection
      return this.available_keywords.filter((kw) => {
        // If keyword is already selected, always show it
        if (this.keywords_filter.includes(kw.title)) return true;

        // Combine current selection with this keyword
        const test_keywords = [...this.keywords_filter, kw.title];

        // Check if any stack has ALL of these keywords
        return this.stacks_without_keyword_filter.some((stack) => {
          if (!stack.keywords || !Array.isArray(stack.keywords)) return false;
          return test_keywords.every((kwf) => stack.keywords.includes(kwf));
        });
      });
    },
    opened_stack() {
      if (!this.$route.query?.stack) return false;
      return this.all_stacks.find(
        (s) => this.getFilename(s.$path) === this.$route.query.stack
      );
    },
  },
  methods: {
    async checkExistingFolder() {
      // Load all folders
      this.all_folders = await this.$api.getFolders({ path: "folders" });

      // Verify active paths exist
      if (this.active_folder_paths.length > 0) {
        const allExist = this.active_folder_paths.every((path) =>
          this.all_folders.find((f) => f.$path === path)
        );
        if (!allExist) {
          // Some paths don't exist, redirect to selection
          this.$router.push({ path: "/explore" });
        }
      }
    },
    toggleMediaFocus(path) {
      const slug = this.getFilename(path);
      this.openStack(slug);
    },
    openStack(stack_slug, slideIndex) {
      let query = Object.assign({}, this.$route.query) || {};
      query.stack = stack_slug;
      // If a slide index is provided, include it in the URL
      if (slideIndex !== undefined && slideIndex !== null) {
        query.slide = slideIndex.toString();
      }
      this.$router.push({ query });
    },
    isFavorite(stack_path) {
      if (
        !this.connected_as?.favorites ||
        this.connected_as.favorites.length === 0
      )
        return false;
      return this.connected_as.favorites.some(
        (f) => f.stack_path === stack_path
      );
    },
    async toggleFav(stack_path) {
      debugger;

      let favorites = this.connected_as?.favorites
        ? this.connected_as.favorites.slice()
        : [];

      if (this.isFavorite(stack_path))
        favorites = favorites.filter((f) => f.stack_path !== stack_path);
      else
        favorites.push({
          stack_path,
          added: +new Date(),
        });

      await this.$api.updateMeta({
        path: this.connected_as.$path,
        new_meta: {
          favorites,
        },
      });
    },
    closeStack() {
      let query = Object.assign({}, this.$route.query) || {};
      delete query.stack;
      this.$router.push({ query });
    },
    toggleCorpus(folder_path) {
      this.$emit("toggleCorpus", folder_path);
    },
    isCommunityActive(folder_path) {
      return this.active_folder_paths.includes(folder_path);
    },
    getFolderTitle(folder_path) {
      const folder = this.all_folders.find((f) => f.$path === folder_path);
      return folder ? folder.title || this.$t("untitled") : this.$t("untitled");
    },
    joinRoom(roomPath) {
      // Only join if we haven't already joined this room
      if (!this.joined_rooms.has(roomPath)) {
        this.$api.join({ room: roomPath });
        this.joined_rooms.add(roomPath);
      }
    },
    async loadStacksFromCommunities() {
      // Load stacks from all active communities and merge them
      const allStacksPromises = this.stack_shared_folder_paths.map(
        (stackPath) => this.$api.getFolders({ path: stackPath })
      );

      const stacksArrays = await Promise.all(allStacksPromises);
      // Merge all stacks and remove duplicates by path
      const stacksMap = new Map();
      stacksArrays.flat().forEach((stack) => {
        if (!stacksMap.has(stack.$path)) {
          stacksMap.set(stack.$path, stack);
        }
      });
      this.all_stacks = Array.from(stacksMap.values());
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  position: relative;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;

  > ._topBar {
    flex: 0 0 auto;
  }

  > ._sharedFolder--content {
    flex: 1 1 0;
  }
}

._sharedFolder--content {
  position: relative;
  overflow: auto;
  height: 100%;
  background-color: white;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));
}

._dayFileSection {
  text-align: left;
  margin: 0 calc(var(--spacing) * 2);
}

._itemGrid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--stack_preview_width, 120px), 1fr)
  );
  // align-items: baseline;
  gap: calc(var(--stack_preview_width, 120px) / 20);
}

._itemGrid.is--compact {
  gap: 0;
}

._stacksList {
  background: var(--sd-bg);
  color: var(--sd-textcolor);
  width: 100%;
  height: 100%;
}

._label {
  position: sticky;
  top: 0;
  z-index: 10;
  // font-size: var(--sl-font-sizelarge);
  font-weight: 800;
  padding: calc(var(--spacing) / 4);
  margin-top: calc(var(--spacing) / 2);
}

._stackModal {
  --sd-separator: var(--h-200);
  --sd-textcolor: var(--h-900);
  --sd-bg: var(--body-bg);
}

._loader {
  position: relative;
  min-height: 80vh;
}

._mediamapContainer {
  width: 100%;
  height: 100%;
}

._noContent {
  margin: calc(var(--spacing) / 1);
}
._topBar {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--h-200);
  overflow-x: auto;
  overflow-y: hidden;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));

  :deep(._content) {
    margin-right: 0;
  }
}

._topBarControls {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  flex: 0 0 auto;
  margin-left: auto;
}

._searchBar {
  flex: 0 0 auto;
  min-width: 300px;
  max-width: 500px;
}

._filterToggle {
  flex: 0 0 auto;

  &.is--active {
    background-color: var(--active-color);
    color: white;
  }
}

._displayOptions {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  flex: 0 0 auto;
}

._zoomSlider {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  flex: 0 0 auto;
}

._zoomSlider ._inputRange {
  width: 100px;
  margin: 0;
}

._viewModeButtons {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  flex: 0 0 auto;
}

._communautesSection {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  flex: 1 1 auto;
  min-width: 0;
}

._communautesLabel {
  flex: 0 0 auto;
  margin-bottom: 0;
}

._corpusItems {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1 1 auto;
  min-width: 0;
  // padding: calc(var(--spacing) / 4) 0;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));
}

._corpusItem {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  // &.is--active {
  //   .u-button {
  //     background: var(--active-color);
  //     color: white;
  //     border-color: var(--active-color);
  //   }
  // }
}

._corpusItemLabel {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  cursor: pointer;
  margin: 0;
}

._corpusCheckbox {
  flex: 0 0 auto;
  cursor: pointer;
  margin: 0;
}

._toggleIcon {
  margin-left: calc(var(--spacing) / 4);
  font-size: 0.75em;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  .u-button:hover & {
    opacity: 1;
  }
}

._addCommunityButton {
  flex: 0 0 auto;
  margin-left: calc(var(--spacing) / 2);
}
</style>
