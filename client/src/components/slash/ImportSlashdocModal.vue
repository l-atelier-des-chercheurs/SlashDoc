<template>
  <BaseModal2 :title="$t('import_document')" @close="$emit('close')">
    <div
      v-if="transfer_percent !== 100"
      class="u-instructions u-spacingBottom"
      v-html="$t('import_document_instructions')"
    />
    <div class="u-spacingBottom" v-if="!folder_to_import">
      <DLabel :str="$t('destination_corpus')" />
      <DestinationCorpusSelector
        :selected_destination_folder_path.sync="
          selected_destination_folder_path
        "
      />
    </div>
    <div
      class="_importZone"
      v-if="!folder_to_import && selected_destination_folder_path"
    >
      <ImportFileZone
        :accepts="'.zip'"
        :files_to_import.sync="files_to_import"
        @update:files_to_import="importSlashdoc($event)"
      />
    </div>
    <div v-else>
      <template v-if="err_message">
        {{ err_message }}
      </template>
      <template v-else>
        <template v-if="transfer_percent < 100">
          {{ $t("import_in_progress") }}<br />
          {{ transfer_percent }}%
        </template>
        <template v-else>
          {{ $t("import_finished") }}
          <router-link v-if="imported_project_path" :to="explorerLink">
            {{ imported_project_title }}
          </router-link>
        </template>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import ImportFileZone from "@/adc-core/ui/ImportFileZone.vue";
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  props: {
    modal_name: String,
    path: String,
  },
  components: { ImportFileZone, DestinationCorpusSelector },
  data() {
    return {
      error_msg: "",
      files_to_import: [],
      id: `admin_images_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      selected_destination_folder_path: this.path || "",

      folder_to_import: undefined,
      transfer_percent: undefined,
      err_message: undefined,

      imported_project_path: undefined,
      imported_project_title: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    explorerLink() {
      if (!this.imported_project_path) return null;

      const community = this.getCommunity(this.imported_project_path);
      const stack_slug = this.getFilename(this.imported_project_path);

      if (!community || !stack_slug) return null;

      return {
        path: "/explore",
        query: {
          communities: community,
          stack: `${community}_${stack_slug}`,
        },
      };
    },
  },
  methods: {
    getCommunity(path) {
      // Extract community name from path (folders/{community}/stacks/{stack-slug})
      const pathParts = path.split("/");
      const communityIndex = pathParts.indexOf("folders");
      return communityIndex !== -1 && pathParts[communityIndex + 1]
        ? pathParts[communityIndex + 1]
        : null;
    },
    async importSlashdoc(files) {
      this.folder_to_import = files.at(0);
      this.transfer_percent = 0;

      const additional_meta = {
        $admins: this.setDefaultContentAdmins(),
        $contributors: [],
      };

      const folder_type = "/stacks";
      const import_path = this.selected_destination_folder_path + folder_type;
      if (!import_path) {
        this.err_message = this.$t("no_communities_available");
        return;
      }

      const new_folder_meta = await this.$api
        .importFolder({
          path: import_path,
          filename: this.folder_to_import.name,
          file: this.folder_to_import,
          additional_meta,
          onProgress: (progressEvent) => {
            this.transfer_percent = parseInt(
              Math.round((progressEvent.loaded * 99) / progressEvent.total)
            );
          },
        })
        .catch((err) => {
          if (err.code === "imported_folder_not_valid")
            this.err_message = this.$t("zip_not_valid_project");
          if (err.code === "imported_folder_is_a_space")
            this.err_message = this.$t("zip_is_space_not_project");
          // this.files_to_import = [];
          // this.folder_to_import = undefined;
          // this.transfer_percent = 0;
          return;
        });

      this.transfer_percent = 100;
      this.imported_project_title =
        new_folder_meta.title || this.$t("untitled");
      this.imported_project_path = new_folder_meta.$path || false;
    },
  },
};
</script>
<style lang="scss" scoped>
._importZone {
  --dropzone-color1: transparent;
  --dropzone-color2: var(--c-rouge);
  color: var(--c-noir);
}
</style>
