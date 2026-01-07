<template>
  <BaseModal2
    :title="$t('manage_communities')"
    :size="'large'"
    @close="$emit('close')"
  >
    <div class="_corpusSelectionModal">
      <div class="_header">
        <!-- <h1 class="_title">{{ $t("Communautés") }}</h1> -->
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
        <CommunityPreview
          v-for="folder in displayed_folders"
          :key="folder.$path"
          :folder="folder"
          :is_selected="selected_folders.includes(folder.$path)"
          @select="handleSelect"
          @remove="showRemoveModal"
        />
        <div v-if="displayed_folders.length === 0" class="_noCommunities">
          {{ $t("no_communities_available") }}
        </div>
      </div>
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
  </BaseModal2>
</template>
<script>
import CommunityPreview from "@/components/archive/CommunityPreview.vue";

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
  },
  data() {
    return {
      show_add_community: false,
      community_to_remove: null,
    };
  },
  computed: {
    displayed_folders() {
      return this.all_folders;
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
._corpusSelectionModal {
  display: flex;
  flex-flow: column nowrap;
  height: 70vh;
}

._header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: calc(var(--spacing));
}

._addCommunityButton {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._communitiesList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) * 2);
  overflow-y: auto;
  flex: 1 1 auto;

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));
}

._actions {
  // position: sticky;
  // bottom: 0;
  width: 100%;
  text-align: center;
  padding-top: calc(var(--spacing) / 2);
  flex: 0 0 auto;
}

._noCommunities {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  color: var(--h-600);
  font-style: italic;
  grid-column: 1 / -1;
}
</style>
