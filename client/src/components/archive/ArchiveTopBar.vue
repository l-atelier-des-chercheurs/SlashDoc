<template>
  <div class="_topBar">
    <div class="_topBarContent">
      <div class="_searchBar">
        <SearchInput2
          ref="searchInput"
          class="_searchInput"
          :value="search_str"
          @input="$emit('update:search_str', $event)"
          :search_placeholder="$t('search_fields')"
        />
        <!-- <button
          type="button"
          class="u-button u-button_icon u-button_transparent _filterToggle"
          :class="{ 'is--active': show_filter_bar }"
          @click="$emit('update:show_filter_bar', !show_filter_bar)"
          :title="$t('toggle_filters')"
        >
          <b-icon icon="sliders" />
        </button> -->
        <span class="_docCount">
          <template v-if="!is_filtered">
            {{ $tc("archive_documents", total_count, { count: total_count }) }}
          </template>
          <template v-else>
            {{
              $t("archive_displayed_count", {
                displayed: displayed_count,
                total: total_count,
              })
            }}
          </template>
        </span>

        <button
          class="u-button u-button_icon"
          type="button"
          :class="{ 'is--active': show_only_favs }"
          @click="$emit('update:show_only_favs', !show_only_favs)"
          :title="$t('favorites_view')"
        >
          <b-icon :icon="show_only_favs ? 'star-fill' : 'star'" scale="0.8" />
        </button>
        <button
          class="u-button u-button_icon"
          type="button"
          :class="{ 'is--active': show_only_my_content }"
          @click="$emit('update:show_only_my_content', !show_only_my_content)"
          :title="$t('only_my_content')"
        >
          <b-icon icon="person-circle" scale="0.8" />
        </button>
      </div>
      <div class="_topBarControls">
        <div class="_displayOptions">
          <div class="_zoomSlider">
            <button
              type="button"
              class="u-button u-button_icon u-button_transparent"
              @click="
                $emit(
                  'update:stack_preview_width',
                  Math.max(50, stack_preview_width - 10)
                )
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
              @input="$emit('update:stack_preview_width', +$event.target.value)"
            />
            <button
              type="button"
              class="u-button u-button_icon u-button_transparent"
              @click="
                $emit(
                  'update:stack_preview_width',
                  Math.min(250, stack_preview_width + 10)
                )
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
              @click="$emit('update:view_mode', 'list')"
              :title="$t('list_view')"
            >
              <b-icon icon="grid3x3" />
            </button>
            <button
              ref="viewModeButtonMap"
              class="u-button u-button_icon _viewModeButton--map"
              type="button"
              :class="{ 'is--active': view_mode === 'map' }"
              @click="$emit('update:view_mode', 'map')"
              :title="$t('map_view')"
            >
              <b-icon icon="map-fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SearchInput2 from "@/components/SearchInput2.vue";

export default {
  props: {
    search_str: {
      type: String,
      default: "",
    },
    show_filter_bar: {
      type: Boolean,
      default: false,
    },
    total_count: {
      type: Number,
      default: 0,
    },
    displayed_count: {
      type: Number,
      default: 0,
    },
    stack_preview_width: {
      type: Number,
      default: 120,
    },
    view_mode: {
      type: String,
      default: "list",
    },
    show_only_favs: {
      type: Boolean,
      default: false,
    },
    show_only_my_content: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SearchInput2,
  },
  computed: {
    is_filtered() {
      return this.displayed_count !== this.total_count && this.total_count > 0;
    },
  },
  i18n: {
    messages: {
      fr: {
        search_fields:
          "Rechercher dans les champs titre et description des documents.",
        toggle_filters: "Afficher/masquer les filtres",
        list_view: "Vue liste",
        favorites_view: "Vue favoris",
        map_view: "Vue carte",
      },
      en: {
        search_fields: "Search in titles or descriptions of documents.",
        toggle_filters: "Toggle filters",
        list_view: "List view",
        favorites_view: "Favorites view",
        map_view: "Map view",
      },
    },
  },
};
</script>
<style lang="scss" scoped>
._topBar {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

._topBarContent {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 2);
  flex: 1 1 auto;
  min-width: 700px;

  > * {
    flex: 0 0 auto;

    &._searchBar {
      flex: 1 1 400px;
    }
    &._topBarControls {
      flex: 0 0 auto;
    }
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
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  flex: 0 0 auto;
  min-width: 300px;
  max-width: 500px;

  ._searchInput {
    flex: 1 1 auto;
  }
}

._filterToggle {
  flex: 0 0 auto;

  &.is--active {
    // background-color: var(--active-color);
    // color: white;
  }
}

._docCount {
  flex: 0 0 auto;
  font-size: 0.9em;
  color: var(--muted-color, #666);
  white-space: nowrap;
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
</style>
