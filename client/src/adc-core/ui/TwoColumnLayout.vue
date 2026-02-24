<template>
  <div
    class="_twoColumnLayout"
    :class="{
      'is--mobile': isMobileView,
      'is--sidebarHidden': !show_sidebar_computed,
    }"
  >
    <!-- <transition name="slide-left"> -->
    <div
      class="_colLeft"
      :class="{ 'is--sidebarHidden': !show_sidebar_computed }"
    >
      <transition name="slide-left">
        <div v-if="show_sidebar_computed" class="_sidebarContent">
          <slot name="sidebar" />
        </div>
      </transition>
    </div>
    <!-- </transition> -->
    <div class="_sidebarToggle">
      <button
        type="button"
        class="u-button u-button_icon"
        :class="{}"
        @click="toggleSidebar"
        :aria-label="
          show_sidebar_computed ? $t('hide_sidebar') : $t('show_sidebar')
        "
      >
        <b-icon
          :icon="show_sidebar_computed ? 'arrow-left' : toggle_sidebar_icon"
          :aria-label="show_sidebar_computed ? $t('hide') : $t('show')"
        />
      </button>
    </div>

    <transition name="fade">
      <div
        class="_colOverlay"
        v-if="show_sidebar_computed && $root.is_mobile_view && false"
        @click="toggleSidebar"
      />
    </transition>

    <div class="_colRight">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  name: "TwoColumnLayout",
  props: {
    sidebarWidth: {
      type: String,
      default: "400px",
    },
    sidebarMobileWidth: {
      type: String,
      default: "250px",
    },
    show_sidebar: {
      type: Boolean,
      default: undefined,
    },
    toggle_sidebar_icon: {
      type: String,
      default: "list-ul",
    },
  },
  data() {
    return {
      show_sidebar_internal: true,
    };
  },
  computed: {
    isMobileView() {
      return Boolean(this.$root?.is_mobile_view);
    },
    show_sidebar_computed() {
      return this.show_sidebar !== undefined
        ? this.show_sidebar
        : this.show_sidebar_internal;
    },
  },
  methods: {
    toggleSidebar() {
      if (this.show_sidebar !== undefined) {
        this.$emit("update:show_sidebar", !this.show_sidebar);
      } else {
        this.show_sidebar_internal = !this.show_sidebar_internal;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._twoColumnLayout {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: stretch;
  gap: 0;
  min-height: 50vh;
  height: 100%;
  padding: 0;

  &.is--mobile {
    // flex-flow: column nowrap;
    overflow-y: auto;
    height: 100%;

    // ._colLeft {
    //   position: relative;
    //   flex: 0 0 auto;

    //   // width: 100%;
    //   height: auto;
    //   // border-right: none;
    //   border-bottom: 1px solid var(--g-200);
    //   overflow: visible;
    //   position: static;
    // }

    ._colRight {
      // position: absolute;
      // inset: 0;
    }
  }
}

._sidebarToggle {
  position: relative;
  height: 100%;
  pointer-events: none;
  border-right: 1px solid var(--g-200);

  > button {
    position: relative;
    width: calc(var(--spacing) * 2);
    height: 100%;
    display: flex;
    align-items: flex-start;
    pointer-events: auto;
    border-radius: 0;
  }
}

._colLeft {
  position: relative;
  z-index: 3;
  flex: 0 1 v-bind(sidebarWidth);
  max-width: 100%;
  background-color: var(--body-bg);
  margin: 0;
  border-right: 1px solid var(--g-200);
  overflow-y: auto;
  overflow-x: hidden;
  top: 0;
  align-self: flex-start;
  height: 100%;

  transition: flex 0.3s ease-in-out;

  &.is--sidebarHidden {
    flex: 0 0 0;
  }
}

._sidebarContent {
  min-width: 320px;
  height: 100%;
}

._twoColumnLayout ._colLeft {
  // padding: calc(var(--spacing) * 2) calc(var(--spacing) * 2);
}

._twoColumnLayout.is--sidebarHidden {
  ._sidebarToggle {
    // border-right: none;
  }
}

._colRight {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  overflow: auto;
  position: relative;
  // min-width: 50vw;
}

._content {
}

._colOverlay {
  position: absolute;
  inset: 0;
  background-color: var(--body-bg);
  opacity: 0.8;
  z-index: 2;
  cursor: pointer;

  ._twoColumnLayout.is--mobile & {
    display: none;
  }
}

// Slide-left transition animation
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-enter-to {
  transform: translateX(0);
}

.slide-left-leave-from {
  transform: translateX(0);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
