<template>
  <div class="_corpusSelection">
    <TwoColumnLayout class="_corpusLayout">
      <template #sidebar>
        <div class="_sidebarContent">
          <div class="_header">
            <h3 class="">{{ $t("all_communities") }}</h3>

            <button
              type="button"
              class="u-button u-button_icon u-button_transparent _addCommunityButton"
              @click="show_add_community = true"
              :title="$t('add_community')"
            >
              <b-icon icon="plus" />
              <!-- {{ $t("add_community") }} -->
            </button>
          </div>

          <div class="_communitiesList">
            <div
              v-for="folder in displayed_folders"
              :key="folder.$path"
              class="_sidebarItem"
              :class="{
                'is--active': active_folder_path === folder.$path,
                'is--selected': selected_folders.includes(folder.$path),
              }"
              @click="active_folder_path = folder.$path"
            >
              <input
                type="checkbox"
                :checked="selected_folders.includes(folder.$path)"
                @click.stop
                @change="updateSelected($event.target.checked, folder.$path)"
              />
              <span class="_sidebarItemTitle">{{ folder.title }}</span>

              <DropDown
                v-if="
                  canLoggedinEditFolder({ folder }) &&
                  active_folder_path === folder.$path
                "
                :right="true"
                :show_label="false"
                @click.native.stop
              >
                <button
                  type="button"
                  class="u-buttonLink u-buttonLink_red"
                  @click="showRemoveModal(folder)"
                >
                  <b-icon icon="trash" />
                  {{ $t("remove") }}
                </button>
              </DropDown>
            </div>

            <div v-if="displayed_folders.length === 0" class="_noCommunities">
              {{ $t("no_communities_available") }}
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <transition name="fade" mode="out-in">
          <CommunityPreview
            v-if="active_folder"
            :key="active_folder.$path"
            :folder="active_folder"
            :is_selected="selected_folders.includes(active_folder.$path)"
            @select="handleSelect"
            @remove="showRemoveModal"
          />
        </transition>
      </template>
    </TwoColumnLayout>

    <div class="_actions">
      <button
        type="button"
        class="u-button u-button_orange"
        :disabled="selected_folders.length === 0"
        @click="$emit('close')"
      >
        {{
          $tc("explore_selected_communities", selected_folders.length, {
            count: selected_folders.length,
          })
        }}
      </button>
    </div>

    <!-- Add Community Modal -->
    <CreateFolder
      v-if="show_add_community"
      :modal_name="$t('add_community')"
      path="folders"
      @close="show_add_community = false"
      @openNew="onCommunityCreated"
    />

    <!-- Remove Community Modal -->
    <RemoveMenu2
      v-if="community_to_remove"
      :path="community_to_remove.$path"
      :modal_title="$t('remove_community')"
      :modal_expl="$t('remove_community_explanation')"
      :success_notification="$t('community_removed_successfully')"
      @close="community_to_remove = null"
      @removedSuccessfully="onCommunityRemoved"
    />
  </div>
</template>
<script>
import CommunityPreview from "@/components/archive/CommunityPreview.vue";
import TwoColumnLayout from "@/adc-core/ui/TwoColumnLayout.vue";

export default {
  props: {
    all_folders: {
      type: Array,
      default: () => [],
    },
    selected_folders: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    CommunityPreview,
    TwoColumnLayout,
  },
  data() {
    return {
      show_add_community: false,
      community_to_remove: null,
      active_folder_path: null,
    };
  },
  computed: {
    displayed_folders() {
      return this.all_folders
        .slice()
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    },
    active_folder() {
      if (!this.active_folder_path) return null;
      return this.displayed_folders.find(
        (f) => f.$path === this.active_folder_path
      );
    },
  },
  watch: {
    displayed_folders: {
      handler(val) {
        if (val.length > 0 && !this.active_folder_path) {
          this.active_folder_path = val[0].$path;
        }
      },
      immediate: true,
    },
  },
  methods: {
    updateSelected(checked, path) {
      let new_selection = this.selected_folders.slice();
      if (checked) {
        if (!new_selection.includes(path)) new_selection.push(path);
      } else {
        new_selection = new_selection.filter((p) => p !== path);
      }
      this.$emit("update:selected_folders", new_selection);
    },
    handleSelect(folder_path, is_selected) {
      this.updateSelected(is_selected, folder_path);
      this.$emit("select", { folder_path, is_selected });
    },
    showRemoveModal(folder) {
      this.community_to_remove = folder;
    },
    onCommunityCreated(new_folder_slug) {
      this.show_add_community = false;
      this.$emit("created", new_folder_slug);
    },
    onCommunityRemoved() {
      this.$emit("remove", this.community_to_remove.$path);
      this.community_to_remove = null;
    },
  },
  i18n: {
    messages: {
      fr: {
        explore_selected_communities:
          "Explorer la communauté sélectionnée | Explorer les {count} communautés sélectionnées",
      },
      en: {
        explore_selected_communities:
          "Explore selected community | Explore {count} selected communities",
      },
    },
  },
};
</script>
<style lang="scss" scoped>
._corpusSelection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: white;

  display: flex;
  flex-flow: column nowrap;

  z-index: 1000;
}

._corpusLayout {
  flex: 1 1 auto;
  min-height: 0; // Fix for nested flex scrolling
}

._sidebarContent {
}

._header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: calc(var(--spacing));
  border-bottom: 1px solid var(--g-200);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);

  h3 {
    margin: 0;
  }
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
}

._sidebarItem {
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  gap: calc(var(--spacing));
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: var(--c-gris-clair);
  }
  &.is--active {
    background: var(--c-gris);
    font-weight: bold;
  }
}

._sidebarItemTitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  padding: calc(var(--spacing) / 2) 0;
}

._actions {
  width: 100%;
  text-align: center;
  padding: calc(var(--spacing) * 2);
  flex: 0 0 auto;
  border-top: 1px solid var(--c-gris);
}

._noCommunities {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--g-700);
  font-style: italic;
}
</style>
