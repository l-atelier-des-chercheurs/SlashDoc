<template>
  <div class="_stackCarousel">
    <template v-if="!files || files.length === 0">
      <div class="u-instructions _nothingToShow">
        {{ $t("nothing_to_show") }}
      </div>
    </template>

    <FileShown
      v-if="current_file_shown"
      class="_stackCarousel--fileshown"
      :key="current_file_shown.$path"
      :file="current_file_shown"
      :position="file_shown_position"
      :can_edit="can_edit"
    />

    <transition-group tag="div" class="_list" name="listComplete">
      <div
        v-for="(file, index) in files"
        class="_preview"
        :class="{
          '_preview--disabled': can_be_selected && !isFileTypeAllowed(file),
        }"
        :data-iscurrent="current_file_shown.$path === file.$path"
        :key="file.$path"
        @click="openFile(index)"
      >
        <MediaContent
          class="_preview--media"
          :file="file"
          :context="'preview'"
          :resolution="360"
        />
        <div v-if="can_be_selected === 'multiple'" class="_selectCheckbox">
          <label :for="boxid(index)">
            <input
              type="checkbox"
              :id="boxid(index)"
              :name="boxname"
              :checked="
                selected_files &&
                selected_files.some((f) => f.$path === file.$path)
              "
              :disabled="!isFileTypeAllowed(file)"
              @change="
                if (isFileTypeAllowed(file)) {
                  $emit('toggleMediaSelection', file, $event.target.checked);
                }
              "
              @click.stop
            />
          </label>
        </div>
        <div v-else-if="can_be_selected === 'single'" class="_selectRadio">
          <label :for="boxid(index)">
            <input
              type="radio"
              :id="boxid(index)"
              :name="boxname"
              :checked="current_file_shown.$path === file.$path"
              :disabled="!isFileTypeAllowed(file)"
              @change="
                if (isFileTypeAllowed(file)) {
                  $emit('selectMedia', file);
                }
              "
              @click.stop
            />
          </label>
        </div>

        <transition name="fade" mode="out-in">
          <div class="_btnRow" v-if="current_file_shown.$path === file.$path">
            <div class="_previewOverlay" />
            <select
              class="_changeOrderSelect"
              size="small"
              :value="index + 1"
              @change="
                $emit('changeMediaOrder', index, +$event.target.value - 1)
              "
            >
              <option
                v-for="(a, i) in new Array(files.length).fill(null)"
                :key="i + 1"
                v-text="i + 1"
              />
            </select>
            <RemoveMenu
              class="_removeBtn"
              :remove_text="$t('remove')"
              :show_button_text="false"
              @remove="$emit('removeMediaFromStack', current_file_shown.$path)"
            />
          </div>
        </transition>

        <div class="_credits">
          <b-icon v-if="hasText(file.caption)" icon="text-left" />
          <b-icon v-if="hasText(file.$credits)" icon="c-circle" />
          <b-icon v-if="hasText(file.bibliography)" icon="bookmark" />
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
import FileShown from "@/components/archive/FileShown.vue";

export default {
  props: {
    files: Array,
    can_edit: Boolean,
    can_be_selected: [Boolean, String],
    selected_files: Array,
    pick_from_types: [String, Array],
  },
  components: {
    FileShown,
  },
  data() {
    return {
      active_file_index: 0,
      is_dragged: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
      en: {},
    },
  },
  created() {},
  mounted() {
    this.$eventHub.$on("carousel.next", this.nextFile);
    this.$eventHub.$on("carousel.prev", this.prevFile);

    // Initialize from URL query parameter
    if (this.$route.query.slide !== undefined) {
      const slideIndex = parseInt(this.$route.query.slide, 10) - 1;
      if (
        !isNaN(slideIndex) &&
        slideIndex >= 0 &&
        slideIndex < this.files.length
      ) {
        this.active_file_index = slideIndex;
      }
    }

    if (this.can_be_selected === "single" && this.current_file_shown) {
      // Only auto-select if the file type is allowed
      if (this.isFileTypeAllowed(this.current_file_shown)) {
        this.$emit("selectMedia", this.current_file_shown);
      }
    }
  },
  beforeDestroy() {
    this.$eventHub.$off("carousel.next", this.nextFile);
    this.$eventHub.$off("carousel.prev", this.prevFile);
  },
  watch: {
    active_file_index(newIndex) {
      // Update URL query parameter when slide index changes
      if (newIndex !== false && newIndex !== null && newIndex !== undefined) {
        const query = { ...this.$route.query };
        query.slide = (newIndex + 1).toString();
        this.$router.replace({ query }).catch(() => {});
      }

      this.$nextTick(() => {
        const current_file = this.$el.querySelector(
          "._preview[data-iscurrent]"
        );
        if (current_file) {
          current_file.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      });
    },
    "$route.query.slide"(newSlide) {
      // Sync with URL changes (e.g., browser back/forward)
      if (newSlide !== undefined) {
        const slideIndex = parseInt(newSlide, 10) - 1;
        if (
          !isNaN(slideIndex) &&
          slideIndex >= 0 &&
          slideIndex < this.files.length
        ) {
          if (this.active_file_index !== slideIndex) {
            this.active_file_index = slideIndex;
          }
        }
      }
    },
  },
  computed: {
    boxname() {
      // Radio buttons must share the same name; ids must be unique per item.
      return `selectinputname-${this._uid}`;
    },
    enable_drag() {
      // hacky but it works
      return (
        typeof this.$eventHub._events["mediatile.drag.end"] !== "undefined"
      );
    },
    current_file_shown() {
      if (this.active_file_index !== false)
        return this.files[this.active_file_index];
      return false;
    },
    file_shown_position() {
      if (this.files.length === 1) return "alone";
      if (this.active_file_index === 0) return "first";
      if (this.active_file_index === this.files.length - 1) return "last";
      return "inbetween";
    },
  },
  methods: {
    boxid(index) {
      // Unique, stable (within this component instance) id for each input.
      return `selectinputid-${this._uid}-${index}`;
    },
    hasText(value) {
      if (value === undefined || value === null) return false;
      return String(value).trim().length > 0;
    },
    toggleFile(index) {
      if (this.active_file_index === index) this.active_file_index = false;
      else this.active_file_index = index;
    },
    openFile(index) {
      this.active_file_index = index;
    },
    prevFile() {
      if (this.active_file_index > 0) this.active_file_index--;
    },
    nextFile() {
      if (this.active_file_index < this.files.length - 1)
        this.active_file_index++;
    },
    isFileTypeAllowed(file) {
      // If no pick_from_types is specified, allow all files
      if (
        !this.pick_from_types ||
        !Array.isArray(this.pick_from_types) ||
        this.pick_from_types.length === 0
      ) {
        return true;
      }

      // Normalize pick_from_types to array of strings
      const allowedTypes = Array.isArray(this.pick_from_types)
        ? this.pick_from_types
        : [this.pick_from_types];

      // Check if file type matches any allowed type
      const fileType = file?.$type || "";
      return allowedTypes.includes(fileType);
    },
  },
};
</script>
<style lang="scss" scoped>
._stackCarousel {
  display: flex;
  flex-flow: column nowrap;

  > ._stackCarousel--fileshown {
    flex: 1 1 auto;
  }

  > ._list {
    flex: 0 0 auto;
  }
}
._nothingToShow {
  padding: calc(var(--spacing) / 2);
}

._list {
  display: flex;
  gap: 2px;
  overflow: auto;
  overscroll-behavior-x: contain;
  // padding: 2px;
  border-top: 1px solid var(--sd-separator);
}
._preview {
  position: relative;

  --thumb-size: 15vh;
  width: var(--thumb-size);
  height: var(--thumb-size);
  flex: 0 0 var(--thumb-size);
  border-right: 1px solid var(--sd-separator);

  // background-color: var(--c-gris);

  overflow: hidden;
  // border-radius: 4px;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    // transform: scale(0.95);
    background: transparent;
  }

  &:not([data-iscurrent]) {
    cursor: pointer;
  }

  ._preview--media {
    transition: all 0.25s ease-out;

    &:hover {
      opacity: 0.7;
    }
  }

  &[data-iscurrent] {
    // pointer-events: none;

    ._preview--media {
      opacity: 0.4;
      filter: blur(2px);
      transform: scale(0.9) rotate(0deg);
    }
  }

  &._preview--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    ._preview--media {
      filter: grayscale(100%);
    }

    ._selectCheckbox,
    ._selectRadio {
      pointer-events: none;
      opacity: 0.5;
    }
  }

  ._mediaContent {
    height: 100%;

    ::v-deep ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-width: none;
    }
  }
}

._btnRow {
  position: absolute;
  inset: 0;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-content: center;
  align-items: flex-start;
}

._previewOverlay {
  position: absolute;
  inset: 0;
  // background-color: var(--g-500);
  // backdrop-filter: blur(10px);
  opacity: 0.7;
}

._removeBtn {
  position: relative;
  // position: absolute;
  // top: 0;
  // right: 0;
  margin: calc(var(--spacing) / 2);
}

._changeOrderSelect {
  margin: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);

  width: 5ch;
}
._credits {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);

  pointer-events: none;

  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
}

._selectCheckbox,
._selectRadio {
  position: absolute;
  z-index: 100;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  > label {
    background-color: rgba(0, 0, 0, 0.5);

    padding: calc(var(--spacing) / 1);
    border-radius: 50%;
  }
}

._selectAllRow {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

._selectAllBtn {
  padding: 4px 12px;
  border-radius: 4px;
  background: var(--c-gris);
  border: 1px solid var(--sd-separator);
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
}
._selectAllBtn:hover {
  background: var(--c-gris-fonce);
}
</style>
