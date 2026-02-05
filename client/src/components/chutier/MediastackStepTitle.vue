<template>
  <div>
    <slot name="uptop"></slot>

    <div class="u-spacingBottom" />

    <div class="_form-title">
      <div class="u-spacingBottom">
        <DLabel :str="$t('title')" />
        <TextInput
          :content="title"
          :required="true"
          :placeholder="$t('document_title')"
          :autofocus="true"
          :can_edit="true"
          @update:content="onTitleChange"
          @toggleValidity="onTitleValidityChange"
        />
      </div>
      <div class="u-spacingBottom _description">
        <DLabel :str="$t('description')" />
        <TextInput
          :content="description"
          :input_type="'editor'"
          :placeholder="$t('description_placeholder')"
          :can_edit="true"
          @update:content="onDescriptionChange"
        />
      </div>
      <div class="u-spacingBottom _position">
        <PositionPicker
          :label="$t('location')"
          :can_edit="true"
          :content="location"
          @newPosition="onLocationChange"
        />
        <div v-if="available_locations.length > 0" class="_locationButtons">
          <div class="u-instructions">
            {{ $t("use_location_from_media") }}
          </div>
          <div class="_locationButtonsList">
            <button
              v-for="(loc, index) in available_locations"
              :key="index"
              type="button"
              class="u-button u-button_small u-button_transparent"
              @click="selectLocation(loc)"
            >
              <b-icon icon="geo-alt" />
              {{ formatLocation(loc) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MediastackStepTitle",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    selected_items: {
      type: Array,
      default: () => [],
    },
    location: {
      type: Object,
      default: () => null,
    },
  },
  components: {
    PositionPicker: () => import("@/adc-core/inputs/PositionPicker.vue"),
  },
  computed: {
    available_locations() {
      if (!this.selected_items || this.selected_items.length === 0) {
        return [];
      }

      const location_map = new Map();

      for (const item of this.selected_items) {
        if (
          item.$location &&
          item.$location.latitude &&
          item.$location.longitude
        ) {
          const key = `${item.$location.latitude.toFixed(
            6
          )},${item.$location.longitude.toFixed(6)}`;
          if (!location_map.has(key)) {
            location_map.set(key, {
              latitude: item.$location.latitude,
              longitude: item.$location.longitude,
              zoom: item.$location.zoom || 2,
            });
          }
        }
      }

      return Array.from(location_map.values());
    },
  },
  methods: {
    onTitleChange(newVal) {
      this.$emit("update:title", newVal);
    },
    onDescriptionChange(newVal) {
      this.$emit("update:description", newVal);
    },
    onTitleValidityChange(isValid) {
      this.$emit("title-validity-changed", isValid);
    },
    onLocationChange(new_location) {
      this.$emit("update:location", new_location);
    },
    selectLocation(loc) {
      this.onLocationChange(loc);
    },
    formatLocation(loc) {
      if (!loc || !loc.latitude || !loc.longitude) return "";
      return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
    },
  },
};
</script>

<style lang="scss" scoped>
._description {
  // border-radius: var(--input-border-radius);
  // background-color: var(--c-gris_clair);
  // overflow: hidden;
}

._position {
  margin-top: calc(var(--spacing) / 2);
}

._locationButtons {
  margin-top: calc(var(--spacing) / 2);
}

._locationButtonsList {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) / 4);
  margin-top: calc(var(--spacing) / 4);
}
</style>
