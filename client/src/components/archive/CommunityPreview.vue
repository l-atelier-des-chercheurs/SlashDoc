<template>
  <div class="_communityPreview">
    <!-- Header -->
    <div class="_header">
      <div class="_titleRow">
        <TitleField
          :field_name="'title'"
          :label="$t('title')"
          :show_label="false"
          :content="folder.title || ''"
          :path="folder.$path"
          :can_edit="can_edit"
          :tag="'h1'"
          class="_title"
        />
        <div class="_meta">
          <StatusTag
            :status="folder.$status"
            :path="folder.$path"
            :status_options="['public', 'private']"
            :can_edit="can_edit"
          />
        </div>
      </div>
      <div class="_subTitle">
        {{ $t("community_visible_in_archive") }}
        <!-- <b-icon icon="info-circle" /> -->
      </div>
    </div>

    <div class="_body">
      <!-- Left Column -->
      <div class="_leftCol">
        <div class="_description">
          <TitleField
            :field_name="'description'"
            :label="$t('description')"
            :show_label="false"
            :content="folder.description || ''"
            :path="folder.$path"
            :can_edit="can_edit"
            :tag="'div'"
            class="_descField"
          />
        </div>

        <div class="_statsSection">
          <h3 class="_sectionTitle">{{ $t("archived_media") }}</h3>
          <div v-if="isLoadingStats" class="_loadingStats">
            <LoaderSpinner />
          </div>
          <div v-else class="_statsGrid">
            <div class="_statItem">
              <b-icon icon="images" />
              {{ $t("images") }} ({{ stats.images }})
            </div>
            <div class="_statItem">
              <b-icon icon="camera-video" />
              {{ $t("videos") }} ({{ stats.videos }})
            </div>
            <div class="_statItem">
              <b-icon icon="file-text" />
              {{ $t("notes") }} ({{ stats.text }})
            </div>
            <div class="_statItem">
              <b-icon icon="table" />
              {{ $t("spreadsheets") }} ({{ stats.spreadsheet }})
            </div>
            <div class="_statItem">
              <b-icon icon="file-pdf" />
              {{ $t("pdf") }} ({{ stats.pdf }})
            </div>
            <div class="_statItem">
              <b-icon icon="mic" />
              {{ $t("audios") }} ({{ stats.audio }})
            </div>
            <div class="_statItem">
              <b-icon icon="box" />
              {{ $t("threed") }} ({{ stats.threed }})
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="_rightCol">
        <div class="_peopleSection">
          <h4 class="_peopleTitle">{{ $t("referent_es") }}</h4>
          <div class="_avatars">
            <AuthorTag
              v-for="adminPath in adminsList"
              :key="adminPath"
              :path="adminPath"
              :show_image_only="true"
              :mode="'link'"
            />
            <span v-if="adminsList.length === 0" class="u-text-small">{{
              $t("none")
            }}</span>
          </div>
        </div>

        <div class="_peopleSection">
          <h4 class="_peopleTitle">{{ $t("contributeur_ices") }}</h4>
          <div class="_avatars">
            <AuthorTag
              v-for="contribPath in contributorsList"
              :key="contribPath"
              :path="contribPath"
              :show_image_only="true"
              :mode="'link'"
            />
            <span v-if="contributorsList.length === 0" class="u-text-small">{{
              $t("none")
            }}</span>
          </div>
        </div>

        <div class="_editAction" v-if="can_edit">
          <button
            type="button"
            class="u-buttonLink"
            @click="show_edit_modal = true"
          >
            <b-icon icon="pencil" />
            {{ $t("modify") }}
          </button>
        </div>

        <div class="_joinAction" v-if="!can_open_community">
          <div class="u-instructions">{{ $t("access_restricted") }}</div>
          <button
            v-if="folder.$admins && folder.$admins.length > 0"
            type="button"
            class="u-button u-button_primary"
            @click="showAskToJoin = true"
          >
            {{ $t("ask_to_join") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <EditAdminsAndContributorsField
      v-if="show_edit_modal"
      :folder="folder"
      :can_edit="can_edit"
      @closeModal="show_edit_modal = false"
    />

    <BaseModal2
      v-if="showAskToJoin"
      :title="$t('ask_to_join')"
      @close="showAskToJoin = false"
    >
      <div style="margin-bottom: 1.5em">
        <p>
          {{ $t("send_email_to_admins") }}
        </p>
        <ul>
          <li v-for="admin in folder.$admins" :key="admin.email">
            <a :href="mailtoLink(admin.email)">
              {{ admin.email }}
            </a>
          </li>
        </ul>
        <p>
          {{ $t("email_instructions") }}
        </p>
      </div>
      <div style="text-align: right">
        <button type="button" class="u-button" @click="showAskToJoin = false">
          {{ $t("close") }}
        </button>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  name: "CommunityPreview",
  props: {
    folder: {
      type: Object,
      required: true,
    },
    is_selected: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      showAskToJoin: false,
      show_edit_modal: false,
      isLoadingStats: false,
      localStats: null,
    };
  },
  mounted() {
    this.fetchStats();
  },
  watch: {},
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.folder });
    },
    can_see() {
      return this.canLoggedinSeeFolder({ folder: this.folder });
    },
    can_open_community() {
      return this.can_edit || this.can_see || this.folder.$status !== "private";
    },
    adminsList() {
      if (!this.folder.$admins) return [];
      return this.folder.$admins;
    },
    contributorsList() {
      if (!this.folder.$contributors) return [];
      return this.folder.$contributors;
    },
    stats() {
      if (this.localStats) return this.localStats;
      return this.calculateStats(this.folder.$files || []);
    },
  },
  methods: {
    mailtoLink(email) {
      return `mailto:${email}`;
    },
    async fetchStats() {
      if (!this.folder.$files) {
        this.isLoadingStats = true;
        try {
          const folderDetails = await this.$api.getFolder({
            path: this.folder.$path,
            detailed_infos: true,
          });
          this.localStats = this.calculateStats(folderDetails.$files || []);
        } catch (e) {
          console.error(e);
        }
        this.isLoadingStats = false;
      } else {
        this.localStats = this.calculateStats(this.folder.$files);
      }
    },
    calculateStats(files) {
      const s = {
        images: 0,
        videos: 0,
        text: 0,
        spreadsheet: 0,
        pdf: 0,
        audio: 0,
        threed: 0,
      };
      files.forEach((f) => {
        const type = f.$type;
        const name = f.name || f.$media_filename || ""; // fallback
        if (type === "image") s.images++;
        else if (type === "video") s.videos++;
        else if (type === "audio") s.audio++;
        else if (type === "pdf") s.pdf++;
        else if (
          type === "text" ||
          name.endsWith(".txt") ||
          name.endsWith(".md")
        )
          s.text++;
        else if (
          type === "spreadsheet" ||
          name.endsWith(".csv") ||
          name.endsWith(".xlsx")
        )
          s.spreadsheet++;
        else if (type === "stl" || type === "obj" || type === "gltf")
          s.threed++;
        else if (
          name.endsWith(".stl") ||
          name.endsWith(".obj") ||
          name.endsWith(".glb")
        )
          s.threed++;
      });
      return s;
    },
  },
  i18n: {
    messages: {
      fr: {
        private: "Privé",
        community_visible_in_archive: "Communauté visible dans l'archive",
        archived_media: "Médias archivés",
        images: "Images",
        videos: "Vidéos",
        notes: "Notes",
        spreadsheets: "Tableurs",
        pdf: "PDF",
        audios: "Audios",
        threed: "3D",
        explore_selected_communities: "Explorer les communautés sélectionnées",
        referent_es: "Référent·es",
        contributeur_ices: "Contributeur·ices",
        modify: "Modifier",
        none: "Aucun",
        access_restricted: "Accès restreint",
        ask_to_join: "Demander à rejoindre",
        send_email_to_admins: "Envoyer un email aux administrateurs",
        email_instructions:
          "Les administrateurs recevront un email avec votre demande.",
        close: "Fermer",
      },
      en: {
        private: "Private",
        community_visible_in_archive: "Community visible in archive",
        archived_media: "Archived media",
        images: "Images",
        videos: "Videos",
        notes: "Notes",
        spreadsheets: "Spreadsheets",
        pdf: "PDF",
        audios: "Audios",
        threed: "3D",
        explore_selected_communities: "Explore selected communities",
        referent_es: "Referents",
        contributeur_ices: "Contributors",
        modify: "Modify",
        none: "None",
        access_restricted: "Access restricted",
        ask_to_join: "Ask to join",
        send_email_to_admins: "Send email to admins",
        email_instructions:
          "The admins will receive an email with your request.",
        close: "Close",
      },
    },
  },
};
</script>
<style lang="scss" scoped>
._communityPreview {
  // height: 100%;
  // display: flex;
  // flex-flow: column nowrap;
  // gap: calc(var(--spacing) * 2);
  background: white;
  // padding-top: calc(var(--spacing));
}

._header {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}

._titleRow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}

._title {
  margin: 0;
  font-size: 2.2rem; // Large title
  font-weight: normal;
}

._status {
  flex: 0 0 auto;
}

._subTitle {
  color: var(--h-600);
  font-size: var(--sl-font-size-small);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

._body {
  flex: 1;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) * 4);
}

._leftCol {
  flex: 1 1 400px;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 2);
}

._description {
  font-size: var(--sl-font-size-medium);
  line-height: 1.5;
}

._statsSection {
  // margin-top: calc(var(--spacing));
}

._sectionTitle {
  margin-bottom: calc(var(--spacing));
}

._statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: calc(var(--spacing));
}

._statItem {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: var(--sl-font-size-small);
  color: var(--h-900);
}

._actionsSection {
  margin-top: auto;
  padding-top: calc(var(--spacing) * 2);
}

._exploreBtn {
  &:hover {
  }
}

._rightCol {
  flex: 0 0 200px;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 2);
}

._peopleSection {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._peopleTitle {
  margin: 0;
  font-size: var(--sl-font-size-small);
  color: var(--h-600);
  font-weight: normal;
}

._avatars {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._editAction {
  margin-top: calc(var(--spacing));
}

._joinAction {
  margin-top: calc(var(--spacing));
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

.u-tag {
  border: 1px solid var(--h-400);
  padding: 0.2em 0.5em;
  border-radius: 2px;
  font-size: 0.8em;
}
</style>
