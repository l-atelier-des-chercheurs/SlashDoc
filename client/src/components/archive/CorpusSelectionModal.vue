<template>
  <div class="_corpusSelection">
    <TwoColumnLayout :show-toggle-button="false" class="_corpusLayout">
      <template #sidebar>
        <div class="_sidebarContent">
          <div class="_header">
            <h3 class="">{{ $t("Communautés") }}</h3>

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
              <span class="_sidebarItemTitle">{{ folder.title }}</span>
              <b-icon
                v-if="selected_folders.includes(folder.$path)"
                icon="check"
              />
            </div>
            <div v-if="displayed_folders.length === 0" class="_noCommunities">
              {{ $t("no_communities_available") }}
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <div class="_preview">
          <CommunityPreview
            v-if="active_folder"
            :key="active_folder.$path"
            :folder="active_folder"
            :is_selected="selected_folders.includes(active_folder.$path)"
            @select="handleSelect"
            @remove="showRemoveModal"
          />
        </div>
      </template>
    </TwoColumnLayout>

    <div class="_actions">
      <button
        type="button"
        class="u-button u-button_primary"
        :disabled="selected_folders.length === 0"
        @click="$emit('close')"
      >
        {{ $t("open") }}
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
      return this.all_folders;
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
    handleSelect(folder_path, is_selected) {
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
        manage_communities: "Gérer les communautés",
        add_community: "Ajouter une communauté",
        no_communities_available: "Aucune communauté disponible",
        open: "Ouvrir",
        remove_community: "Supprimer la communauté",
        remove_community_explanation:
          "Êtes-vous sûr de vouloir supprimer cette communauté ? Cette action est irréversible.",
        community_removed_successfully: "Communauté supprimée avec succès",
      },
      en: {
        manage_communities: "Manage communities",
        add_community: "Add community",
        no_communities_available: "No communities available",
        open: "Open",
        remove_community: "Remove community",
        remove_community_explanation:
          "Are you sure you want to remove this community? This action cannot be undone.",
        community_removed_successfully: "Community removed successfully",
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
  padding: calc(var(--spacing) / 2);
}

._header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing));
  border-bottom: 1px solid var(--h-200);

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
  padding: calc(var(--spacing) / 2);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  margin-bottom: 2px;
  transition: background-color 0.2s;

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
}

._preview {
  padding: calc(var(--spacing));
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

._actions {
  width: 100%;
  text-align: center;
  padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);
  flex: 0 0 auto;
  border-top: 1px solid var(--c-gris);
}

._noCommunities {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--h-600);
  font-style: italic;
}
</style>
