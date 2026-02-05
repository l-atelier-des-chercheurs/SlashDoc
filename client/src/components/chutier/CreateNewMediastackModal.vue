<template>
  <BaseModal2
    class=""
    :size="modal_size"
    :confirm_before_closing="true"
    :title="current_step === 4 ? $t('review') : undefined"
    @save=""
    @close="$emit('close')"
  >
    <div class="_createNewMediastackModal">
      <portal-target name="largemedia" multiple />
      <div class="_content">
        <div v-if="current_step < 4" class="_breadcrumb">
          <button
            type="button"
            v-for="(step, index) in steps"
            :key="step.label"
            class="step"
            :class="
              current_step === index
                ? 'active'
                : current_step > index
                ? 'completed'
                : ''
            "
            :title="step.label"
            @click="current_step = index"
          >
            <div class="step-line" v-if="index > 0"></div>
            <div class="step-circle">
              <div v-if="current_step >= index" class="step-label">
                {{ step.label }}
              </div>
            </div>
          </button>
        </div>

        <div class="_form" :key="current_step">
          <div class="_form-step" v-if="false">
            <div class="_form-step-title">
              <h2>
                {{ steps[current_step].label }}
              </h2>
            </div>
          </div>

          <div class="_uptopThumbs" v-if="[0, 2, 3, 4].includes(current_step)">
            <div
              class="_thumbGrid"
              v-if="selected_items && selected_items.length"
            >
              <ChutierItem
                v-for="file in selected_items"
                :key="file.$path"
                :file="file"
                :context="'show_only_thumbs'"
                :is_selected="false"
                class="_thumbCell"
              />
            </div>
          </div>

          <MediastackStepTitle
            v-if="current_step === 0"
            :title.sync="stack_title"
            :description.sync="stack_description"
            :selected_items="selected_items"
            :location.sync="stack_location"
            @title-validity-changed="has_valid_title = $event"
          >
          </MediastackStepTitle>

          <MediastackStepCredits
            v-if="current_step === 1"
            :selected_items="selected_items"
            :general_credit.sync="stack_general_credit"
          />

          <MediastackStepKeywords
            v-if="current_step === 2"
            :keywords.sync="stack_tags"
          >
          </MediastackStepKeywords>

          <MediastackStepAuthors
            v-if="current_step === 3"
            :authors.sync="stack_authors"
            :destination_folder_path.sync="selected_destination_folder_path"
          />

          <MediastackStepReview
            v-if="current_step === 4"
            :title="stack_title"
            :description="stack_description"
            :keywords="stack_tags"
            :selected_destination_folder_path="selected_destination_folder_path"
            :authors="stack_authors"
            :location="stack_location"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div>
        <button
          class="u-button u-button_transparent"
          v-if="status === 'idle'"
          @click="backStep"
        >
          <b-icon icon="arrow-left" />
          {{ $t("back") }}
        </button>
      </div>

      <button
        class="u-button"
        v-if="current_step < steps.length - 1"
        :disabled="!allow_next_step"
        @click="nextStep"
      >
        {{ $t("next") }}
        <b-icon icon="arrow-right" />
      </button>
      <button
        class="u-button u-button_bleuvert"
        v-else-if="current_step === steps.length - 1 && status === 'idle'"
        @click="publishMediastack"
      >
        <b-icon icon="check-circle-fill" />
        {{ $t("contribute") }}
      </button>
      <span v-else-if="status === 'publishing'">
        {{ $t("publishing") }}
      </span>
      <span v-else-if="status === 'completed'">
        {{ $t("completed") }}
      </span>

      <div v-if="!allow_next_step" class="u-instructions _cantNextInstr">
        <template v-if="current_step === 0">
          {{ $t("add_title_to_continue") }}
        </template>
        <template v-if="current_step === 2">
          {{ $t("add_keywords_to_continue") }}
        </template>
        <template v-if="current_step === 3">
          {{ $t("add_authors_to_continue") }}
        </template>
      </div>
    </template>
  </BaseModal2>
</template>
<script>
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import MediastackStepTitle from "@/components/chutier/MediastackStepTitle.vue";
import MediastackStepCredits from "@/components/chutier/MediastackStepCredits.vue";
import MediastackStepKeywords from "@/components/chutier/MediastackStepKeywords.vue";
import MediastackStepAuthors from "@/components/chutier/MediastackStepAuthors.vue";
import MediastackStepReview from "@/components/chutier/MediastackStepReview.vue";

export default {
  props: {
    selected_items: Array,
  },
  components: {
    ChutierItem,
    MediastackStepTitle,
    MediastackStepCredits,
    MediastackStepKeywords,
    MediastackStepAuthors,
    MediastackStepReview,
  },
  data() {
    return {
      current_step: 0,
      steps: [
        {
          label: this.$t("title"),
        },
        {
          label: this.$t("credit"),
        },
        {
          label: this.$t("keywords"),
        },
        {
          label: this.$t("archiving_community"),
        },
        {
          label: this.$t("review"),
        },
      ],

      stack_title: "",
      has_valid_title: false,
      stack_description: "",
      stack_common_credit: "",
      stack_general_credit: "",
      stack_tags: [],
      stack_authors: [],
      stack_location: null,

      status: "idle",
      selected_destination_folder_path: undefined,
    };
  },
  created() {
    if (this.connected_as.$path)
      this.stack_authors.push(this.connected_as.$path);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    modal_size() {
      if (this.current_step === 2) return "full";
      else return "small";
    },
    modal_name() {
      return this.$t("create_document");
      // +
      // " (" +
      // (this.current_step + 1) +
      // "/" +
      // this.steps.length +
      // ")"
    },
    allow_next_step() {
      if (this.current_step === 0) return this.has_valid_title;
      if (this.current_step === 2) return this.stack_tags.length > 0;
      return true;
    },
    show_only_thumbs() {
      return this.current_step > 0 && this.current_step !== 4;
    },
  },
  methods: {
    backStep() {
      if (this.current_step > 0) this.current_step--;
      else this.$emit("close");
    },
    async nextStep() {
      // If leaving the credits step (step 1), apply general credit to items with empty credits
      if (this.current_step === 1 && this.stack_general_credit) {
        await this.applyGeneralCreditToItems();
      }
      this.current_step++;
    },
    async applyGeneralCreditToItems() {
      // Apply general credit to all selected items that have empty credits
      for (const file of this.selected_items) {
        if (!file.$credits || file.$credits.trim() === "") {
          try {
            await this.$api.updateMeta({
              path: file.$path,
              new_meta: {
                $credits: this.stack_general_credit,
              },
            });
            // Update the local file object to reflect the change
            file.$credits = this.stack_general_credit;
          } catch (error) {
            console.error(`Failed to update credit for ${file.$path}:`, error);
          }
        }
      }
    },
    async publishMediastack() {
      this.status = "publishing";

      // CREATE STACK IN DESTINATION CORPUS

      const path_to_destination =
        this.selected_destination_folder_path + "/stacks";

      let additional_meta = {
        $status: "public",
        requested_slug: "stack",
        $admins: this.stack_authors,
        title: this.stack_title,
        description: this.stack_description,
        keywords: this.stack_tags,
      };

      if (this.stack_location && this.stack_location.latitude && this.stack_location.longitude) {
        additional_meta.$location = this.stack_location;
      }

      const new_stack_slug = await this.$api.createFolder({
        path: path_to_destination,
        additional_meta,
      });

      const stack_path = path_to_destination + "/" + new_stack_slug;

      // COPY FILES TO STAC

      let stack_files_metas = [];
      for (const file of this.selected_items) {
        const file_meta_name = await this.$api.copyFile({
          path: file.$path,
          path_to_destination_folder: stack_path,
          new_meta: {},
        });
        stack_files_metas.push(file_meta_name);
        await this.$api.deleteItem({ path: file.$path });
      }

      let new_meta = {
        stack_files_metas,
      };
      if (stack_files_metas.length >= 1)
        new_meta.$preview = stack_files_metas[0];

      await this.$api.updateMeta({
        path: stack_path,
        new_meta,
      });

      await new Promise((r) => setTimeout(r, 250));

      this.status = "completed";
      this.$emit("stackPosted", new_stack_slug);

      await new Promise((r) => setTimeout(r, 1000));

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._createNewMediastackModal {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // z-index: 10000;
  // overflow-y: auto;

  // padding: calc(var(--spacing) * 2);
  // background-color: white;
  // background-color: var(--g-50);
}

._content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  // max-width: 360px;
  margin: 0 auto;
}

._breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;

  > * {
    &:last-child {
      display: none;
    }
  }
  // margin-bottom: var(--spacing);
}

.step {
  appearance: none;
  background-color: transparent;
  padding: 0;

  position: relative;
  display: flex;
  align-items: center;
  color: var(--g-200);
  margin-top: var(--spacing);
  pointer-events: none;

  &.active {
    color: var(--g-500);
  }

  &.completed {
    color: var(--g-500);
    pointer-events: auto;
  }
}

.step-circle {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 50%;

  .step.active &,
  .step.completed & {
    background-color: currentColor;
  }
}

.step-label {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  font-weight: 600;
  transform: translateX(-50%);
  left: 50%;
  margin-top: 4px;
  white-space: nowrap;
  transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  .step.completed:not(:hover) & {
    opacity: 0;
    // color: var(--g-500);
  }

  .step:hover & {
    opacity: 1;
  }
}

.step-line {
  width: 50px;
  height: 2px;
  background-color: currentColor;
  transition: background-color 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}

._form {
  width: 100%;
  background-color: white;
  // padding: calc(var(--spacing) * 1) 0;
}

._cantNextInstr {
  width: 100%;
  text-align: right;
}

._form-review-items {
  > * {
    margin-bottom: calc(var(--spacing) / 4);
    // max-width: 22em;
  }

  &.has--onlyThumbs {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: calc(var(--spacing) / 2);
    > * {
      // max-width: 22em;
    }
  }
}

._uptopThumbs {
  width: 100%;
  margin-bottom: calc(var(--spacing) * 2);
  // max-width: 420px;
  // margin: 0 auto;
}

._thumbGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: calc(var(--spacing) / 2);
}

._thumbCell {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--g-50);

  /* Force ChutierItem thumb to fill the cell */
  :deep(._chutierRow) {
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: 0;
  }
  :deep(._chutierRow--rows) {
    height: 100%;
  }
  :deep(._chutierRow--previewMedia) {
    height: 100%;
    width: 100%;
  }
  :deep(._chutierRow--preview) {
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
  }
}
</style>
<style lang="scss">
._baseModal--content:has(._createNewMediastackModal) {
  // background-color: var(--g-50) !important;
}
</style>
