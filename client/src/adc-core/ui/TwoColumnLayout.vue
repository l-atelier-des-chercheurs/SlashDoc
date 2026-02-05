<template>
  <div
    class="_twoColumnLayout"
    :class="{
      'is--mobile': isMobileView,
      'is--sidebarHidden': !showSidebar,
    }"
  >
    <transition name="fade">
      <div class="_colLeft" v-if="showSidebar">
        <slot name="sidebar" />
      </div>
    </transition>
    <div class="_sidebarToggle" v-if="showToggleButton">
      <button
        type="button"
        class="u-button u-button_icon"
        :class="{}"
        @click="$emit('update:showSidebar', !showSidebar)"
        :aria-label="showSidebar ? $t('hide_sidebar') : $t('show_sidebar')"
      >
        <b-icon
          :icon="showSidebar ? 'arrow-left' : 'list-ul'"
          :aria-label="showSidebar ? $t('hide') : $t('show')"
        />
      </button>
    </div>

    <transition name="fade">
      <div
        class="_colOverlay"
        v-if="showSidebar && $root.is_mobile_view && false"
        @click="$emit('update:showSidebar', false)"
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
    showSidebar: {
      type: Boolean,
      default: true,
    },
    showToggleButton: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isMobileView() {
      return Boolean(this.$root?.is_mobile_view);
    },
    singleColumnMobileMode() {
      return this.isMobileView && this.showToggleButton;
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
  // height: 100%;
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
  z-index: 20;
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
  flex: 0 0 v-bind(sidebarWidth);
  max-width: calc(100% - var(--spacing) * 2);
  background-color: var(--body-bg);
  margin: 0;
  border-right: 1px solid var(--g-200);
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  align-self: flex-start;
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
  min-width: 0;
  // min-width: 20vw;
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
</style>
