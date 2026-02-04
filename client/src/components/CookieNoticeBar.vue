<template>
  <transition name="slideup">
    <div v-if="is_visible" class="_cookieNoticeBar">
      <p class="_cookieNoticeBar--text">
        {{ $t("cookie_notice_message") }}
        <router-link to="/confidentiality" class="_cookieNoticeBar--link">
          {{ $t("cookie_notice_link_text") }}
        </router-link>
      </p>
      <button
        type="button"
        class="u-button u-button_small _cookieNoticeBar--btn"
        @click="acceptNotice"
      >
        {{ $t("cookie_notice_accept") }}
      </button>
    </div>
  </transition>
</template>
<script>
const STORAGE_KEY = "cookie_notice_acknowledged";

export default {
  name: "CookieNoticeBar",
  data() {
    return {
      is_visible: false,
    };
  },
  mounted() {
    try {
      this.is_visible = localStorage.getItem(STORAGE_KEY) !== "true";
    } catch (_) {
      this.is_visible = true;
    }
  },
  methods: {
    acceptNotice() {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch (_) {}
      this.is_visible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._cookieNoticeBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
  background: var(--g-100);
  color: var(--g-900);
  border-top: 1px solid var(--g-300);
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.06);
}

._cookieNoticeBar--text {
  margin: 0;
  font-size: var(--sl-font-size-small);
  flex: 1 1 20ch;
  min-width: 0;
}

._cookieNoticeBar--link {
  color: var(--g-700);
  text-decoration: underline;
  font-weight: 600;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: var(--g-900);
  }
}

._cookieNoticeBar--btn {
  flex-shrink: 0;
  background-color: var(--g-700);
  color: var(--g-50);

  &:hover,
  &:focus-visible {
    background-color: var(--g-900);
  }
}
</style>
